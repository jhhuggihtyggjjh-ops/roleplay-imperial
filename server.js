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
