/* patches.js — remendos aplicados ao index.html quando o servidor o envia.
   Para mudar o jogo, edite este arquivo (o index.html não precisa ser mexido). */
const R = [];
const rep = (nome, antigo, novo) => R.push([nome, antigo, novo]);rep('convite-org',
  "const k0=(a[0]==='/finvite'?['fav','pol','exe','fam','gob']:Object.keys(ORGN)).find(canInv);",
  "const _c=(a[0]==='/finvite'?['fav','pol','exe','fam','gob']:Object.keys(ORGN)).filter(canInv);if(_c.length>1&&a[0]!=='/finvite'){chatSay('📨 Para qual organização? Use: /convidar ORGANIZAÇÃO ID · ex: /convidar policia '+a[1]+' · você pode: '+_c.map(x=>ORGN[x]).join(', '),'sys');return}const k0=_c[0];");
rep('convite-msg',
  "chatSay('📨 '+invRole(o)+' · convite para '+ORGN[o]+' enviado a '+name,'sys')",
  "chatSay('📨 Convite para '+ORGN[o]+' enviado a '+name+' · entra no cargo 1','sys')");
rep('convite-painel',
  "h+=CARD+'<small>'+invRole(o)+' · você pode convidar para '+ORGN[o]+'</small>",
  "h+=CARD+'<small>Seu cargo: '+invRole(o)+' · convidando para '+ORGN[o]+'</small>");

/* 1) Veículo certo para os outros jogadores (carro/caminhão apareciam como moto) */
rep('veiculo',
  "if(typeof HELI!=='undefined'&&HELI)return 'm';",
  "if(typeof FLY!=='undefined'&&FLY)return 'm';");

/* 2) /promover e /subir*: aceita a organização no comando, não exige lista local e para no cargo 4 */
rep('promover-cabecalho',
  "function rkCmd(t,a,up,fk){",
  "function rkCmd(t,a,up,fk){const _fk0=fk;if(!fk){const _w=a.map(x=>ORGA[String(x).toLowerCase()]).find(Boolean);if(_w)fk={exe:'exe',pol:'pol',fav:'fv',fam:'fam',gob:'gob',hos:'hos'}[_w]}");
rep('promover-lista',
  "const k=ks.find(o=>P.me||(MO.ros[RKR[o]]||[]).some(n=>rkLow(n)===rkLow(P.name)));",
  "const k=ks.find(o=>P.me||(MO.ros[RKR[o]]||[]).some(n=>rkLow(n)===rkLow(P.name)))||(fk?ks[0]:(ks.length===1?ks[0]:undefined));");
rep('promover-erro',
  "if(!k){chatSay('❌ '+P.name+' não está na sua organização. Convide com /convidar','sys');return}",
  "if(!k){chatSay('❌ Qual organização? Use: /promover ID ORGANIZAÇÃO · policia, exercito, favela, familia, governo ou hospital','sys');return}");
rep('promover-limite',
  "if(nr<1||nr>5){chatSay('⚠️ '+P.name+' já está no '",
  "if(up&&!_fk0&&nr>=5){chatSay('🔒 O /promover vai só até Sub Líder (4). Para dar Líder use: /passarlider ID 5 ORGANIZAÇÃO','sys');return}\n if(nr<1||nr>5){chatSay('⚠️ '+P.name+' já está no '");

/* 3) /passarlider ID CARGO [organização]: aceita família e não exige lista local */
rep('passarlider-org',
  "const want=a[3]?{exe:'exe',pol:'pol',fav:'fv',gob:'gob',hos:'hos'}[ORGA[String(a[3]).toLowerCase()]]:null;",
  "const want=a[3]?{exe:'exe',pol:'pol',fav:'fv',fam:'fam',gob:'gob',hos:'hos'}[ORGA[String(a[3]).toLowerCase()]]:null;");
rep('passarlider-orginvalida',
  "Organização inválida: use exercito, policia, favela, governo ou hospital",
  "Organização inválida: use exercito, policia, favela, familia, governo ou hospital");
rep('passarlider-busca',
  "const k=(want?[want]:['exe','pol','fv','gob','hos']).find(o=>P.me?inOrg(o):(MO.ros[RKR[o]]||[]).some(n=>rkLow(n)===rkLow(P.name)));",
  "const k=(want&&!P.me)?want:(want?[want]:['exe','pol','fv','fam','gob','hos']).find(o=>P.me?inOrg(o):(MO.ros[RKR[o]]||[]).some(n=>rkLow(n)===rkLow(P.name)));");
rep('passarlider-erro',
  "if(!k){chatSay('❌ '+P.name+' não está no Exército, Polícia, Favela, Governo ou Hospital. Convide com /convidar','sys');return}",
  "if(!k){chatSay('❌ Qual organização? Use: /passarlider ID CARGO ORGANIZAÇÃO · ex: /passarlider 12 3 policia','sys');return}");

/* 4) /demitir ID [organização] para todas as organizações */const DEMITIR = `
(function(){try{
var KS=['exe','pol','fv','fam','gob','hos'];
var NM={exe:'Exército',pol:'Polícia',fv:'Favela',fam:'Família',gob:'Governo',hos:'Hospital'};
var WORD={exercito:'exe','exército':'exe',policia:'pol','polícia':'pol',favela:'fv',lider:'fv','líder':'fv',familia:'fam','família':'fam',governo:'gob',hospital:'hos'};
var lo=function(s){return String(s==null?'':s).toLowerCase()};
var cl=function(s){return String(s==null?'':s).replace(/[|~]/g,'').slice(0,24)};
var say=function(t){try{chatSay(t,'sys')}catch(e){}};
function myRank(k){if(ADM)return 6;try{return inOrg(k)?rkOf(k):0}catch(e){return 0}}
function dropRoster(k,name){try{var o=RKR[k];if(MO.ros[o])MO.ros[o]=MO.ros[o].filter(function(n){return lo(n)!==lo(name)});delete rkT(k)[lo(name)];svMO()}catch(e){}}
function demitir(a){
  var tok=null,org=null;
  for(var i=1;i<a.length;i++){var x=lo(a[i]);if(/^#?\\d+$/.test(x)){if(!tok)tok=x.replace('#','')}else if(WORD[x]&&!org)org=WORD[x]}
  var allowed=KS.filter(function(k){return myRank(k)>=4});
  if(!allowed.length)return false;
  if(!tok){say('Use: /demitir ID [organização] · ex: /demitir 12 policia');return true}
  var k=org||(allowed.length===1?allowed[0]:null);
  if(!k){say('Use: /demitir ID ORGANIZAÇÃO · você pode em: '+allowed.map(function(z){return NM[z]}).join(', '));return true}
  if(allowed.indexOf(k)<0){if(k==='hos')return false;say('🔒 Para demitir da '+NM[k]+' você precisa ser ADM, líder ou sub-líder (cargo 4+)');return true}
  var P=findPerson(tok);
  if(!P){say('❌ Não achei ninguém com o ID '+tok+'. Veja /pessoas');return true}
  if(P.me){say('😅 Você não pode demitir a si mesmo');return true}
  if(!P.rm){say('❌ Só dá para demitir jogadores online');return true}
  if(!ADM){var tr=rkOfName(k,P.name),mr=myRank(k);if(tr>=mr){say('🔒 Você só demite quem está abaixo de você');return true}}
  var nm=cl(P.name);
  if(online)netSend({t:'chat',m:'~~dem~~'+k+'|'+nm});
  dropRoster(k,nm);
  say('🚪 '+nm+' foi demitido: '+NM[k]);try{msg('🚪 '+nm+' demitido: '+NM[k],1)}catch(e){}
  return true}
function auth(f,k){
  try{
    if((typeof ARKS!=='undefined'&&(+ARKS[f]||0)>=4)||(typeof ADMON!=='undefined'&&ADMON[f]&&ADMON[f].r>=4))return 2;
    if((rkT(k)[f]||0)>=4)return 1;
    var mk=(MO.mem||{})[RKR[k]];if(mk&&lo(mk)===f)return 1;
    if(k==='pol'&&lo(holdBy('pol'))===f)return 1;
    if(k==='fv'&&lo(holdBy('lider'))===f)return 1;
    if(k==='gob'&&GOVLS&&GOVLS[f])return 1;
  }catch(e){}
  return 0}
function leave(k,byAdm,by){
  var o=RKR[k],me=lo(rkMe());
  if(!inOrg(k))return;
  if(k==='fam'&&FAM)return;
  if(k==='gob'&&gobL()&&!byAdm)return;
  var papel=k==='pol'?'pol':k==='fv'?'lider':'';
  if(papel&&ROLE===papel){if(!byAdm)return;ROLE=null;try{localStorage.removeItem('mrr')}catch(e){}try{rlTag()}catch(e){}}
  try{delete MO.mem[o]}catch(e){}
  if(k==='exe')MO.enl=0;
  try{delete rkT(k)[me]}catch(e){}
  if(k==='hos'){try{localStorage.setItem('mrhosm',0)}catch(e){}}
  try{svMO()}catch(e){}
  say('🚪 '+by+' demitiu você: '+NM[k]);try{msg('🚪 Você foi demitido: '+NM[k],1)}catch(e){}}
function demRecv(d){
  var q=/^~~dem~~(exe|pol|fv|fam|gob|hos)\\|([^|~]{1,24})$/.exec(String(d.m).slice(0,60));
  if(!q)return;
  var k=q[1],nm=q[2],f=lo(d.n),me=lo(rkMe());
  if(!f||f===me)return;
  var a=auth(f,k);if(!a)return;
  if(lo(nm)===me)leave(k,a===2,cl(d.n));else dropRoster(k,nm)}var _cc=chatCmd;
chatCmd=function(t){
  try{var a=String(t).trim().split(/\\s+/);if(lo(a[0])==='/demitir'&&demitir(a))return}catch(e){console.warn('demitir',e)}
  return _cc.apply(this,arguments)};
var _nm=netMsg;
netMsg=function(d){
  try{if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~dem~~')===0){demRecv(d);return}}catch(e){}
  return _nm.apply(this,arguments)};
}catch(e){console.warn('demitir-patch',e)}})();
`;

module.exports = function (html) {
  for (const [nome, antigo, novo] of R) {
    if (html.includes(antigo)) html = html.split(antigo).join(novo);
    else console.warn('[patches] não aplicado:', nome);
  }
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-demitir">' + DEMITIR + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};/* 5) Tiro entre jogadores (PvP): quem leva o tiro perde vida; na Área Segura ninguém é ferido */
const PVP = `
(function(){try{
var DMG={pistola:12,m4:10,doze:32,smg:7,sniper:55};
var pend={},timer=null,RL={},lastMsg={};
function flush(){
  timer=null;
  for(var n in pend){var o=pend[n];if(o.d>0&&online)netSend({t:'chat',m:'~~pvp~~'+n+'|'+Math.min(99,Math.round(o.d))+'|'+(o.h?1:0)})}
  pend={}}
function shot(k){
  if(!online||!remotes||!remotes.size)return;
  var x0=px,z0=pz;
  if(typeof inLot==='function'&&inLot(x0,z0))return;
  var W=WD[k]||{},rng=W.rng||30;
  var fx=-Math.sin(ph),fz=-Math.cos(ph);
  var L=rng;try{L=Math.min(rng,wallHit(fx,fz,rng))}catch(e){}
  var best=null,bt=L;
  remotes.forEach(function(r){
    if(!r||r.dn)return;
    var dx=r.x-x0,dz=r.z-z0,t=dx*fx+dz*fz;
    if(t<=0||t>=bt)return;
    if(Math.abs(dx*fz-dz*fx)>=.8)return;
    if(typeof inLot==='function'&&inLot(r.x,r.z))return;
    best=r;bt=t});
  if(!best)return;
  var dmg=DMG[k]||10*((typeof DM!=='undefined'&&DM[k])||1),hs=0;
  try{if(HSM(best.g.position,bt)>1){hs=1;dmg*=1.5}}catch(e){}
  try{hitMark()}catch(e){}
  var o=pend[best.n]||(pend[best.n]={d:0,h:0});o.d+=dmg;if(hs)o.h=1;
  if(!timer)timer=setTimeout(flush,150)}
function recv(d){
  var q=/^~~pvp~~([^|~]{1,24})\\|(\\d{1,2})\\|([01])$/.exec(String(d.m).slice(0,48));
  if(!q||q[1]!==myName)return;
  var f=rmByName(d.n);if(!f||f.dn)return;
  var now=Date.now();if(now-(RL[d.n]||0)<60)return;RL[d.n]=now;
  var x0=foot?px:bx,z0=foot?pz:bz;
  if(Math.hypot(f.x-x0,f.z-z0)>140)return;
  if(typeof inLot==='function'&&(inLot(x0,z0)||inLot(f.x,f.z)))return;
  var dm=Math.min(70,+q[2]);if(!(dm>0))return;
  hurt(dm);
  if(now-(lastMsg[d.n]||0)>1500){lastMsg[d.n]=now;try{chatSay('🔫 '+d.n+' acertou você (-'+dm+')','sys')}catch(e){}}}
var _atk=attack;
attack=function(){
  var k=null,m0=0;
  try{k=wpn?WK[wpn-1]:null;m0=k&&inv[k]?inv[k].m:0}catch(e){}
  var r=_atk.apply(this,arguments);
  try{if(k&&inv[k]&&inv[k].m<m0)shot(k)}catch(e){console.warn('pvp',e)}
  return r};
var _nm=netMsg;
netMsg=function(d){
  try{if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~pvp~~')===0){recv(d);return}}catch(e){}
  return _nm.apply(this,arguments)};
}catch(e){console.warn('pvp-patch',e)}})();
`;

const _base = module.exports;
module.exports = function (html) {
  html = _base(html);
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-pvp">' + PVP + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};/* 6) /demitir: líder (cargo 5) também pode demitir quem tem o mesmo cargo 5 */
const _base2 = module.exports;
module.exports = function (html) {
  return _base2(html).split("if(tr>=mr){").join("if(mr>=5?tr>mr:tr>=mr){");
}/* 7) Visual entre jogadores: acessórios, jogador caído deitado e queda de 20 s */
const VIS = `
(function(){try{
var ACR={},lastSig='',lastSend=0;
function mine(){
  try{var L=[];for(var c in ACST.on){var k=ACST.on[c];if(k&&ACST.own.indexOf(k)>=0)L.push(k)}L.sort();return L.join(',')}catch(e){return ''}}
setInterval(function(){
  try{if(!online||!started)return;
    var s=mine(),now=Date.now();
    if(s!==lastSig||now-lastSend>15000){lastSig=s;lastSend=now;netSend({t:'chat',m:'~~acc~~'+s})}
  }catch(e){}},1000);
function recv(d){
  var m=String(d.m).slice(7,120),L=[];
  if(m){m.split(',').forEach(function(k){if(/^[A-Za-z0-9_]{1,12}$/.test(k)&&ACD.some(function(x){return x.k===k})&&L.indexOf(k)<0&&L.length<8)L.push(k)})}
  ACR[d.n]=L}
function sync(){
  try{remotes.forEach(function(r){
    var want=ACR[r.n]||[],sig=want.join(',');
    if(r._acs===sig)return;
    (r._acg||[]).forEach(function(g){if(g.parent)g.parent.remove(g)});
    r._acg=[];r._acs=sig;
    want.forEach(function(k){
      var d=ACD.find(function(x){return x.k===k});if(!d)return;
      var MT=ACMOUNT[d.c];if(!MT||!MT.f)return;
      var cfg=MT.f,g=accBuild(d,'f');
      g.position.set(cfg.pos[0],cfg.pos[1],cfg.pos[2]);g.rotation.set(cfg.rot[0],cfg.rot[1],cfg.rot[2]);
      if(cfg.s)g.scale.setScalar(cfg.s);g.visible=true;
      (d.c==='maleta'?r.fo.armL:r.fo.g).add(g);r._acg.push(g)})})}catch(e){}}
setInterval(sync,500);
var _rt=remoteTick;
remoteTick=function(dt){
  var res=_rt.apply(this,arguments);
  try{remotes.forEach(function(r){
    var g=r.fo&&r.fo.g;if(!g)return;
    if(r.dn&&r.f){g.visible=true;if(r.b)r.b.visible=false;g.rotation.x=Math.PI/2;g.position.y=.18;r._lay=1}
    else if(r._lay){g.rotation.x=0;g.position.y=0;r._lay=0}
  })}catch(e){}
  return res};
var _nm=netMsg;
netMsg=function(d){
  try{if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~acc~~')===0){if(d.n!==myName)recv(d);return}}catch(e){}
  return _nm.apply(this,arguments)};
}catch(e){console.warn('visual-patch',e)}})();
`;

const _base3 = module.exports;
module.exports = function (html) {
  html = _base3(html).split("DWN.end=Date.now()+60000;").join("DWN.end=Date.now()+20000;");
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-visual">' + VIS + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};

/* 8) Loja de armas: ao entrar no jogo, quem tem arma na mochila continua com "tenho arma"; a compra salva na hora */
const _base4 = module.exports;
module.exports = function (html) {
  return _base4(html)
    .split("money=d.money;deliv=d.deliv;hasGun=!!d.hasGun;").join("money=d.money;deliv=d.deliv;hasGun=!!d.hasGun||Object.keys(inv).length>0;")
    .split("hasGun=true;saveG();saveW();\n  if(!wpn){wpn=WK.indexOf(k)+1;gun.visible=true}").join("hasGun=true;saveG();try{netSave(true)}catch(e){}saveW();\n  if(!wpn){wpn=WK.indexOf(k)+1;gun.visible=true}");
};/* 10) Prisão: 10 min por estrela, sem fiança e /soltaradm ID (admin solta preso) */
const PRI = `
(function(){try{
var say=function(t){try{chatSay(t,'sys')}catch(e){}};
function admRank(f){try{var tp=ADMON[f];return Math.max(+ARKS[f]||0,tp&&tp.exp>Date.now()?(+tp.r||0):0)}catch(e){return 0}}
var _cc=chatCmd;
chatCmd=function(t){
  try{var a=String(t).trim().split(/\\s+/);
    if(String(a[0]).toLowerCase()==='/soltaradm'){
      if(!(ADM&&ARK>=2)){say('🔒 Só ADM pode usar /soltaradm');return}
      if(!a[1]){say('Use: /soltaradm ID');return}
      var nm=admTarget(a[1]);
      if(!nm){say('❌ Não achei jogador online com esse ID');return}
      netSend({t:'chat',m:'~~sol~~'+String(nm).replace(/[|~]/g,'').slice(0,24)});
      say('🔓 Soltando '+nm+'…');return}
  }catch(e){console.warn('soltaradm',e)}
  return _cc.apply(this,arguments)};
var _nm=netMsg;
netMsg=function(d){
  try{if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~sol~~')===0){
    var q=/^~~sol~~([^|~]{1,24})$/.exec(String(d.m).slice(0,40));
    var f=String(d.n||'').toLowerCase();
    if(q&&f!==myN()&&admRank(f)>=2&&String(q[1]).toLowerCase()===myN()&&jail.on){
      if(typeof CAP!=='undefined'&&CAP.on){CAP.on=0;try{CAPV.visible=false}catch(e){}}
      jailRelease();say('🔓 Um admin soltou você');try{msg('🔓 Solto por um admin',1)}catch(e){}}
    return}}catch(e){}
  return _nm.apply(this,arguments)};
}catch(e){console.warn('prisao-patch',e)}})();
`;

const _base6 = module.exports;
module.exports = function (html) {
  html = _base6(html)
    .split("const JZ=-900,JMS=300000;").join("const JZ=-900,JMS=600000;")
    .split("jailGo(Math.max(.2,min/5));").join("jailGo(Math.max(.1,min/10));")
    .split("'+CAP.n*5+' min).'").join("'+CAP.n*10+' min).'")
    .split("jb.style.display='block';jb.textContent='💸 Pagar fiança R$ '+fmt(Math.ceil(t/60)*1000)}").join("jb.style.display='none'}")
    .split("jb.addEventListener('pointerdown',e=>{e.preventDefault();const t=Math.ceil(").join("jb.addEventListener('pointerdown',e=>{e.preventDefault();return;const t=Math.ceil(");
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-prisao">' + PRI + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};

/* 9) Arma guardada nas costas/cintura dos outros jogadores: mesma posição que aparece no seu personagem */
const _base5 = module.exports;
module.exports = function (html) {
  return _base5(html).split("if(HIP[k]){m.rotation.x=-Math.PI/2;m.scale.setScalar(.9);o.add(m);o.position.set(i?-.26:.26,.95,.02)}").join("if(1){var ZC={pistola:-.08,m4:-.25,doze:-.28,smg:-.03,sniper:-.33};m.position.z=-(ZC[k]||0);var w=new THREE.Group();w.add(m);o.add(w);if(PIST[k]){w.rotation.y=Math.PI/2;o.position.set(i?-.06:.06,1,.17)}else{m.rotation.z=Math.PI/2;w.rotation.x=Math.PI/2;o.rotation.z=i?-.8:.8;o.position.set(0,1.2,.2+i*.04)}}");
};/* 11) Gráfico Ultra: /graficos ultra = resolução máxima da tela, com ajuste automático de FPS */
const GFX = `
(function(){try{
var say=function(t){try{chatSay(t,'sys')}catch(e){}};
function on(v,quiet){
  window.__ULTRA=!!v;
  try{localStorage.setItem('mrultra',v?'1':'0')}catch(e){}
  try{PR=v?3:QP[SV.q];fit()}catch(e){}
  if(!quiet)say(v?'🖼️ Gráfico ULTRA ligado: resolução máxima da tela (o jogo baixa sozinho se o FPS cair)':'🖼️ Gráfico normal')}
var _cc=chatCmd;
chatCmd=function(t){
  try{var a=String(t).trim().split(/\\s+/),c=String(a[0]).toLowerCase();
    if(c==='/graficos'||c==='/gráficos'||c==='/4k'){
      var w=String(a[1]||'').toLowerCase();
      if(c==='/4k')w='ultra';
      if(w==='ultra'||w==='4k'||w==='max'){on(true);return}
      if(w==='normal'||w==='padrao'||w==='padrão'||w==='off'){on(false);return}
      say('Use: /graficos ultra  ou  /graficos normal');return}
  }catch(e){console.warn('graficos',e)}
  return _cc.apply(this,arguments)};
try{if(localStorage.getItem('mrultra')==='1')setTimeout(function(){on(true,true)},1500)}catch(e){}
}catch(e){console.warn('graficos-patch',e)}})();
`;

const _base7 = module.exports;
module.exports = function (html) {
  html = _base7(html).split("Math.min(devicePixelRatio,2,Math.max(PR*dyn,.5))").join("Math.min(devicePixelRatio,window.__ULTRA?3:2,Math.max(PR*dyn,.5))");
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-graficos">' + GFX + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};/* 12) Rolar com arma na mão (puxão de lado) e o rolamento aparece para os outros jogadores */
const ROL = `
(function(){try{
var DUR=500;
function ease(p){return 1-Math.pow(1-p,2.2)}
var _rt=remoteTick;
remoteTick=function(dt){
  var res=_rt.apply(this,arguments);
  try{var now=performance.now();remotes.forEach(function(r){
    var f=r.fo,g=f&&f.g;if(!g)return;
    var p=r._rl?(now-r._rl)/DUR:2;
    if(p<1&&!r.dn&&r.f){
      var a=-ease(p)*Math.PI*2,sq=.62+.1*Math.sin(p*Math.PI),H=1.8*sq;
      var tk=Math.min(1,Math.sin(p*Math.PI)*1.7);
      g.visible=true;g.rotation.x=a;g.scale.set(1,sq,1);
      g.position.y=.5*H*(1-Math.cos(a))+.15*Math.abs(Math.sin(a));
      try{f.legL.rotation.x=f.legR.rotation.x=1.2*tk}catch(e){}
      r._rolling=1}
    else if(r._rolling){g.rotation.x=0;g.scale.set(1,1,1);g.position.y=0;r._rolling=0}
  })}catch(e){}
  return res};
var _nm=netMsg;
netMsg=function(d){
  try{if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~rol~~')===0){
    if(d.n!==myName){var r=rmByName(d.n);if(r)r._rl=performance.now()}
    return}}catch(e){}
  return _nm.apply(this,arguments)};
}catch(e){console.warn('rolar-patch',e)}})();
`;

const _base8 = module.exports;
module.exports = function (html) {
  html = _base8(html)
    .split("if(ok&&CR&&!RLL.on&&RLL.cd<=0)start(ix,iy)}").join("if(ok&&(CR||(wpn>0&&Math.abs(ix)>=Math.abs(iy)*.8))&&!RLL.on&&RLL.cd<=0)start(ix,iy)}")
    .split("RLL.on=true;RLL.t=0;RLL.dx=vx;RLL.dz=vz;RLL.yaw=Math.atan2(-vx,-vz);").join("RLL.on=true;RLL.t=0;RLL.dx=vx;RLL.dz=vz;RLL.yaw=Math.atan2(-vx,-vz);try{netSend({t:'chat',m:'~~rol~~1'})}catch(e){}");
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-rolar">' + ROL + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};/* 13) Som do tiro: M4, AK-47 e AK dourada mais secos e estalados (menos eco) */
const _base9 = module.exports;
module.exports = function (html) {
  return _base9(html)
    .split("m4:{cH:3200,cg:1,cd:.022,bf:5600,bd:.36,bg:.8,bo:100,og:1,rv:.3,tl:.22},").join("m4:{cH:3800,cg:1.25,cd:.02,bf:6200,bd:.27,bg:.85,bo:105,og:.95,rv:.2,tl:.14},")
    .split("ak:{cH:2700,cg:1.1,cd:.024,bf:4600,bd:.4,bg:.9,bo:86,og:1.1,rv:.34,tl:.26},").join("ak:{cH:3300,cg:1.3,cd:.022,bf:5400,bd:.3,bg:.95,bo:90,og:1.05,rv:.22,tl:.16},")
    .split("akg:{cH:2900,cg:1.1,cd:.024,bf:4800,bd:.42,bg:.9,bo:84,og:1.15,rv:.36,tl:.26},").join("akg:{cH:3500,cg:1.3,cd:.022,bf:5600,bd:.3,bg:.95,bo:88,og:1.08,rv:.23,tl:.16},");
};/* 14) Acessórios: refazer ao trocar de roupa e mostrar o ajuste para os outros · banimento: o servidor decide */
const BAN = `
(function(){try{
var _cc=chatCmd;
chatCmd=function(t){
  try{
    var a=String(t).trim().split(' ').filter(Boolean),c=String(a[0]||'').toLowerCase();
    if(ADM&&(c==='/banir'||c==='/desbanir'||c==='/bans')){
      var tok=a[1]||'',nm=null;
      if(c==='/bans')netSend({t:'bans'});
      else if(tok){nm=isNaN(+tok.replace('#',''))?tok.replace('#',''):admTarget(tok)}
      if(c==='/banir'&&nm)netSend({t:'ban',n:nm,r:a.slice(2).join(' ').slice(0,60)||'sem motivo'});
      if(c==='/desbanir'&&nm)netSend({t:'unban',n:nm});
    }
  }catch(e){console.warn('ban',e)}
  return _cc.apply(this,arguments)};
}catch(e){console.warn('ban-patch',e)}})();
`;

const _base10 = module.exports;
module.exports = function (html) {
  html = _base10(html);
  const T = [
    ["var ACR={},lastSig='',lastSend=0;", "var ACR={},ACJ={},lastSig='',lastSend=0,lastJ='',lastJT=0;"],
    ["function recv(d){", "function recvJ(d){var q=String(d.m).slice(7).split('|');var k=q[0];if(!/^[A-Za-z0-9_]{1,12}$/.test(k))return;var n=function(i,a,b){var v=+q[i];return isFinite(v)?Math.max(a,Math.min(b,v)):0};(ACJ[d.n]=ACJ[d.n]||{})[k]={x:n(1,-100,100),y:n(2,-100,100),z:n(3,-100,100),rx:n(4,-360,360),ry:n(5,-360,360),rz:n(6,-360,360),s:n(7,0,500)}}\nfunction recv(d){"],
    ["var want=ACR[r.n]||[],sig=want.join(',');", "var want=ACR[r.n]||[],sig=want.join(',')+'|'+JSON.stringify(ACJ[r.n]||{})+'|'+(r.fo&&r.fo.g&&r.fo.g.uuid);"],
    ["if(cfg.s)g.scale.setScalar(cfg.s);g.visible=true;", "if(cfg.s)g.scale.setScalar(cfg.s);var A=(ACJ[r.n]||{})[k];if(A){g.position.x+=A.x/100;g.position.y+=A.y/100;g.position.z-=A.z/100;g.rotation.x+=A.rx*Math.PI/180;g.rotation.y+=A.ry*Math.PI/180;g.rotation.z+=A.rz*Math.PI/180;if(A.s)g.scale.multiplyScalar(A.s/100)}g.visible=true;"],
    ["setInterval(sync,500);", "setInterval(sync,500);\nsetInterval(function(){try{if(!online||!started)return;var L=[];for(var c in ACST.on){var k=ACST.on[c];if(k&&ACST.own.indexOf(k)>=0)L.push(k)}var M=L.map(function(k){var a=(ACADJ[k]&&ACADJ[k].f)||{};return '~~acj~~'+k+'|'+[a.x,a.y,a.z,a.rx,a.ry,a.rz,a.s].map(function(v){return Math.round(+v||0)}).join('|')});var sg=M.join(';'),now=Date.now();if(sg===lastJ&&now-lastJT<15000)return;lastJ=sg;lastJT=now;M.forEach(function(m,i){setTimeout(function(){netSend({t:'chat',m:m})},i*150)})}catch(e){}},1000);"],
    ["if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~acc~~')===0){if(d.n!==myName)recv(d);return}", "if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~acj~~')===0){if(d.n!==myName)recvJ(d);return}if(d&&d.t==='chat'&&typeof d.m==='string'&&d.m.indexOf('~~acc~~')===0){if(d.n!==myName)recv(d);return}"],
    ["{const bn=banAll()[String(d.n).toLowerCase()];if(bn!==undefined){banSet(d.n,bn);return}}", "{try{const B=banAll();delete B[String(d.n).toLowerCase()];localStorage.setItem('mrban',JSON.stringify(B))}catch(e){}}"],
  ];
  for (const [a, b] of T) {
    if (html.includes(a)) html = html.split(a).join(b);
    else console.warn('[patches] não aplicado (14):', a.slice(0, 40));
  }
  const i = html.lastIndexOf('</body>');
  const tag = '<script id="patch-ban">' + BAN + '</script>';
  return i >= 0 ? html.slice(0, i) + tag + html.slice(i) : html + tag;
};
