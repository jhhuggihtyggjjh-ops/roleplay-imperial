/* patches.js — remendos aplicados ao index.html quando o servidor o envia.
   Para mudar o jogo, edite este arquivo (o index.html não precisa ser mexido). */
const R = [];
const rep = (nome, antigo, novo) => R.push([nome, antigo, novo]);

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
};
