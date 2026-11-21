/* Servidor do Roleplay Imperial — HTTP (index.html) + WebSocket em /ws
   Render: Build Command = npm install · Start Command = npm start
   Variáveis opcionais: MAX_PLAYERS (150) · START_MONEY (1000) · DATA_FILE (data.json) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 3000;
const MAX = +process.env.MAX_PLAYERS || 150;
const START_MONEY = +process.env.START_MONEY || 1000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const TICK_MS = 100;
const MAX_MONEY = 1e12;

/* ---------- contas (arquivo JSON) ---------- */
let DB = {};
try { DB = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || {}; } catch (e) { DB = {}; }
let dirty = false;
function persist() {
  if (!dirty) return;
  dirty = false;
  try { fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(DB)); fs.renameSync(DATA_FILE + '.tmp', DATA_FILE); }
  catch (e) { console.error('erro ao salvar', e.message); dirty = true; }
}
setInterval(persist, 5000);
const hash = (p, salt) => crypto.scryptSync(String(p), salt, 32).toString('hex');
const key = u => String(u).toLowerCase();
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

/* ---------- HTTP ---------- */
const INDEX = path.join(__dirname, 'index.html');
const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200); return res.end('ok'); }
  if (url === '/' || url === '/index.html') {
    fs.readFile(INDEX, (err, buf) => {
      if (err) { res.writeHead(500); return res.end('index.html não encontrado'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(buf);
    });
    return;
  }
  res.writeHead(404); res.end('404');
});

/* ---------- jogo ---------- */
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });
const players = new Map();   // id -> jogador logado
let nextId = 1;

const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
function broadcast(o, except) {
  const s = JSON.stringify(o);
  for (const p of players.values()) if (p.ws !== except && p.ws.readyState === 1) p.ws.send(s);
}
const byName = n => { const k = key(n); for (const p of players.values()) if (key(p.n) === k) return p; return null; };
const cleanName = s => String(s || '').trim();

function login(ws, kind, d) {
  const u = cleanName(d.u), p = String(d.p || '');
  if (!/^[\p{L}\p{N}_.\-]{3,14}$/u.test(u)) return send(ws, { t: 'err', m: 'Usuário: 3 a 14 letras/números/_' });
  if (p.length < 3 || p.length > 64) return send(ws, { t: 'err', m: 'Senha: mínimo 3 caracteres' });
  const k = key(u);
  let acc = DB[k];
  if (kind === 'reg') {
    if (acc) return send(ws, { t: 'err', m: 'Esse usuário já existe' });
    const salt = crypto.randomBytes(16).toString('hex');
    acc = DB[k] = { n: u, salt, h: hash(p, salt), money: START_MONEY, deliv: 0, hasGun: false, x: '', created: Date.now() };
    dirty = true;
  } else {
    if (!acc) return send(ws, { t: 'err', m: 'Usuário não encontrado' });
    const a = Buffer.from(hash(p, acc.salt)), b = Buffer.from(acc.h);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return send(ws, { t: 'err', m: 'Senha incorreta' });
  }
  const old = byName(acc.n);
  if (old) { send(old.ws, { t: 'err', m: 'Conta aberta em outro lugar' }); removePlayer(old); try { old.ws.close(); } catch (e) {} }
  if (players.size >= MAX) return send(ws, { t: 'err', m: 'Servidor cheio (' + MAX + '/' + MAX + ')' });

  const me = { id: nextId++, n: acc.n, ws, x: 0, z: 0, h: 0, f: 1, s: 0, seen: 0, tick: 0, tokens: 40, last: Date.now() };
  ws.me = me;
  const list = [...players.values()].map(q => ({ id: q.id, n: q.n, x: q.x, z: q.z, h: q.h, f: q.f }));
  players.set(me.id, me);
  send(ws, { t: 'ok', n: acc.n, money: acc.money, deliv: acc.deliv, hasGun: !!acc.hasGun, x: acc.x || '', players: list, count: players.size });
  broadcast({ t: 'join', id: me.id, n: me.n, x: me.x, z: me.z, h: me.h, f: me.f }, ws);
  broadcast({ t: 'count', n: players.size });
}

function removePlayer(me) {
  if (!me || !players.has(me.id)) return;
  players.delete(me.id);
  broadcast({ t: 'leave', id: me.id });
  broadcast({ t: 'count', n: players.size });
}

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { t: 'hello', n: players.size, max: MAX });

  ws.on('message', raw => {
    let d; try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || typeof d.t !== 'string') return;
    if (d.t === 'login' || d.t === 'reg') return login(ws, d.t, d);
    const me = ws.me; if (!me) return;

    // limite de mensagens: 8/s com rajada de 40 (protege o servidor com 150 jogadores)
    const now = Date.now();
    me.tokens = Math.min(40, me.tokens + (now - me.last) * 0.008); me.last = now;
    if (d.t !== 'pos') { if (me.tokens < 1) return; me.tokens--; }

    switch (d.t) {
      case 'pos':
        me.x = num(d.x, me.x); me.z = num(d.z, me.z); me.h = num(d.h, me.h);
        me.f = d.f ? 1 : 0; me.s = num(d.s, 0); me.seen = 0;       // seen=0 → mudou
        me.dirty = true;
        {   // ID do veículo (v), armas (w) e helicóptero (e) viajam junto da posição
          const v = typeof d.v === 'string' && /^[a-z][0-9a-f]{0,6}$/.test(d.v) ? d.v : 'm';
          const w = typeof d.w === 'string' && /^[a-z0-9_]{0,16}\|[a-z0-9_,]{0,40}$/.test(d.w) ? d.w : '';
          const e = typeof d.e === 'string' && /^[0-9a-z|.\-]{1,60}$/.test(d.e) ? d.e : '';
          if (v !== me.v || w !== me.w || e !== me.e) { me.v = v; me.w = w; me.e = e; me.metaDirty = true; }
        }
        break;
      case 'chat': {
        const m = String(d.m == null ? '' : d.m).slice(0, 120);
        if (m) broadcast({ t: 'chat', n: me.n, m });
        break;
      }
      case 'voice':
        if (typeof d.d === 'string' && d.d.length < 4000) broadcast({ t: 'voice', n: me.n, s: num(d.s), d: d.d }, ws);
        break;
      case 'inv': case 'invr': {
        const to = byName(d.to); if (!to) break;
        const o = { t: d.t, from: me.n, o: String(d.o || '').slice(0, 8) };
        if (d.t === 'invr') o.ok = d.ok ? 1 : 0;
        send(to.ws, o); break;
      }
      case 'save': {
        const acc = DB[key(me.n)]; if (!acc) break;
        acc.money = Math.max(0, Math.min(MAX_MONEY, num(d.money, acc.money)));
        acc.deliv = Math.max(0, num(d.deliv, acc.deliv));
        acc.hasGun = !!d.hasGun;
        if (typeof d.x === 'string' && d.x.length < 20000) acc.x = d.x;
        dirty = true; break;
      }
    }
  });

  ws.on('close', () => removePlayer(ws.me));
  ws.on('error', () => {});
});

/* posições: só quem mudou; jogadores longe (>150 m) a cada 10 ticks */
let tickN = 0;
setInterval(() => {
  tickN++;
  const all = [...players.values()];
  for (const a of all) {
    const out = [];
    for (const b of all) {
      if (b === a || (!b.dirty && !b.metaDirty)) continue;
      const far = Math.hypot(b.x - a.x, b.z - a.z) > 150;
      if (far && tickN % 10) continue;
      const row = [b.id, +b.x.toFixed(2), +b.z.toFixed(2), +b.h.toFixed(3), b.f, +b.s.toFixed(1)];
      if (tickN % 10 === 0 || b.metaDirty) { row.push(b.v || 'm', b.w || ''); if (b.e) row.push(b.e); }
      out.push(row);
    }
    if (out.length) send(a.ws, { t: 'st', p: out });
  }
  for (const b of all) { b.metaDirty = false; if (tickN % 10 === 0) b.dirty = true; else b.dirty = false; }   // reenvia todos 1x/s (quem parou também)
}, TICK_MS);

/* derruba conexões mortas */
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { try { ws.terminate(); } catch (e) {} continue; }
    ws.isAlive = false; try { ws.ping(); } catch (e) {}
  }
}, 30000);

process.on('SIGTERM', () => { persist(); process.exit(0); });
server.listen(PORT, () => console.log('Roleplay Imperial rodando na porta ' + PORT + ' · máx ' + MAX));
