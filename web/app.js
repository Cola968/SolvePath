'use strict';

const root = document.getElementById('app');
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const dayKey = (d=new Date()) => d.toISOString().slice(0,10);
const uid = (p='id') => p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
const load = (k, fallback) => { try { const v=localStorage.getItem(k); return v===null ? fallback : JSON.parse(v); } catch { return fallback; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}) : '';
const fmtTime = (ts) => ts ? new Date(ts).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}) : '';

const ICONS = {
  home:'<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
  note:'<path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h3"/><path d="M8 11h8M8 15h8"/>',
  repeat:'<path d="M20 7h-8a7 7 0 1 0 6.3 10"/><path d="m17 3 3 4-3 4"/>',
  stack:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v5M9 20h6"/>',
  search:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  camera:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="m8 6 1.5-2h5L16 6"/><circle cx="12" cy="13" r="4"/>',
  text:'<path d="M5 5h14M12 5v14M8 19h8"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.5-4.5M8.2 13.2l7.5 4.5"/>',
  star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  pen:'<path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z"/><path d="m13.5 6.5 3.5 3.5"/>',
  marker:'<path d="m6 15 8-8 4 4-8 8H6v-4Z"/><path d="M5 21h14"/>',
  eraser:'<path d="m7 18-3-3 9-9 5 5-7 7H7Z"/><path d="M11 18h8"/>',
  select:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M9 9h6v6H9z"/>',
  shape:'<rect x="4" y="4" width="7" height="7" rx="1"/><circle cx="16.5" cy="16.5" r="3.5"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m21 15-5-5L5 20"/>',
  undo:'<path d="m9 7-4 4 4 4"/><path d="M5 11h8a6 6 0 0 1 6 6"/>',
  redo:'<path d="m15 7 4 4-4 4"/><path d="M19 11h-8a6 6 0 0 0-6 6"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/>',
  copy:'<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M5 21h14"/>',
  fit:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  play:'<path d="m9 7 8 5-8 5V7Z"/>',
  close:'<path d="m7 7 10 10M17 7 7 17"/>',
  grid:'<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'
};
function icon(name,size=18){ return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||'')+'</svg>'; }
ICONS.pin='<path d="M9 4h6"/><path d="m10 4-1 6-3 3h12l-3-3-1-6"/><path d="M12 13v8"/>';
ICONS.folder='<path d="M3 6h7l2 2h9v10H3z"/><path d="M3 6V4h6l2 2"/>';
ICONS.homeFill='<path fill="currentColor" stroke="none" d="M2.7 10.5 12 3l9.3 7.5v10.2a.8.8 0 0 1-.8.8h-5.7v-7h-5.6v7H3.5a.8.8 0 0 1-.8-.8z"/>';
ICONS.noteFill='<path fill="currentColor" stroke="none" d="M5 2.8h10.2L19.2 7v14.2H5z"/><path stroke="white" stroke-width="1.5" d="M9 11h6M9 15h6"/>';
ICONS.repeatFill='<path fill="currentColor" stroke="none" d="M20.8 6.2 17 2.8v2.4h-5a8 8 0 0 0-7.7 10.1l2.1-.6A5.8 5.8 0 0 1 12 7.4h5v2.2zM3.2 17.8 7 21.2v-2.4h5a8 8 0 0 0 7.7-10.1l-2.1.6A5.8 5.8 0 0 1 12 16.6H7v-2.2z"/>';
ICONS.stackFill='<path fill="currentColor" stroke="none" d="m12 2.5 9.5 5.2L12 13 2.5 7.7z"/><path fill="currentColor" stroke="none" opacity=".82" d="m3.2 11.2 8.8 4.9 8.8-4.9v2.5L12 18.6l-8.8-4.9z"/><path fill="currentColor" stroke="none" opacity=".62" d="m3.2 15.6 8.8 4.9 8.8-4.9v2.2L12 22.5l-8.8-4.7z"/>';

const KEYS = {
  notes:'ss10:notes', rounds:'ss10:rounds', reviews:'ss10:reviews', profile:'ss10:profile',
  trophies:'ss10:trophies', activity:'ss10:activity', deleted:'ss10:deleted', folders:'ss12:folders'
};
function defaultNote(){
  return {id:uid('note'),title:'Unbenannt',subject:'Ohne Fach',paper:'ruled',favorite:false,pinned:false,createdAt:Date.now(),updatedAt:Date.now(),
    text:'',images:[],shapes:[]};
}
function migrate(){
  let notes=load(KEYS.notes,null);
  if(!notes){
    const legacy=load('snapstudy-notes-v4',load('snapstudy-notes',null));
    notes=Array.isArray(legacy)&&legacy.length?legacy.map(n=>Object.assign({subject:'Physik',paper:'ruled',favorite:false,pinned:false,createdAt:n.updatedAt||Date.now(),updatedAt:Date.now(),images:[],shapes:[]},n)):[];
    save(KEYS.notes,notes);
  }
  if(!localStorage.getItem(KEYS.rounds)) save(KEYS.rounds,load('snapstudy-library-v4',[]));
  if(!localStorage.getItem(KEYS.reviews)) save(KEYS.reviews,load('snapstudy-reviews-v4',[]));
  if(!localStorage.getItem(KEYS.profile)) save(KEYS.profile,Object.assign({xp:0,streak:0,last:'',sessions:0,perfects:0,reviewsDone:0},load('snapstudy-profile',{})));
  if(!localStorage.getItem(KEYS.trophies)) save(KEYS.trophies,{unlocked:{}});
  if(!localStorage.getItem(KEYS.activity)) save(KEYS.activity,[]);
  if(!localStorage.getItem(KEYS.deleted)) save(KEYS.deleted,[]);
}
migrate();

function normalizeDocumentsV12(){
  const convert=(n)=>{
    if(Array.isArray(n.pages)&&n.pages.length)return Object.assign({folderId:null,tags:[],pinned:false,favorite:false},n);
    const pageId=uid('page');
    const page={id:pageId,title:'Seite 1',text:String(n.text||''),paper:n.paper||'ruled',images:Array.isArray(n.images)?n.images:[],shapes:Array.isArray(n.shapes)?n.shapes:[],bookmark:false};
    const oldStrokes=load('ss10:strokes:'+n.id,[]);
    if(oldStrokes.length&&!localStorage.getItem('ss12:strokes:'+n.id+':'+pageId))save('ss12:strokes:'+n.id+':'+pageId,oldStrokes);
    return Object.assign({},n,{folderId:n.folderId||null,tags:Array.isArray(n.tags)?n.tags:[],pages:[page]});
  };
  save(KEYS.notes,load(KEYS.notes,[]).map(convert));
  save(KEYS.deleted,load(KEYS.deleted,[]).map(convert));
  if(!localStorage.getItem(KEYS.folders))save(KEYS.folders,[]);
}
normalizeDocumentsV12();

const data = {
  notes:()=>load(KEYS.notes,[]), setNotes:v=>save(KEYS.notes,v),
  rounds:()=>load(KEYS.rounds,[]), setRounds:v=>save(KEYS.rounds,v),
  reviews:()=>load(KEYS.reviews,[]), setReviews:v=>save(KEYS.reviews,v),
  profile:()=>load(KEYS.profile,{xp:0,streak:0,last:'',sessions:0,perfects:0,reviewsDone:0}), setProfile:v=>save(KEYS.profile,v),
  deleted:()=>load(KEYS.deleted,[]), setDeleted:v=>save(KEYS.deleted,v),
  folders:()=>load(KEYS.folders,[]), setFolders:v=>save(KEYS.folders,v),
  strokes:(noteId,pageId)=>load(pageId?'ss12:strokes:'+noteId+':'+pageId:'ss10:strokes:'+noteId,[]),
  setStrokes:(noteId,pageId,v)=>{if(v===undefined){v=pageId;pageId=null;}save(pageId?'ss12:strokes:'+noteId+':'+pageId:'ss10:strokes:'+noteId,v)}
};

const TROPHIES = [
  ['first','Losgelegt','1 Lernrunde abgeschlossen','sessions',1,20],
  ['s5','Im Rhythmus','5 Lernrunden abgeschlossen','sessions',5,35],
  ['st3','Drei Tage','3 Tage in Folge gelernt','streak',3,35],
  ['xp250','250 XP','250 XP gesammelt','xp',250,40],
  ['perfect','Fehlerfrei','Eine Runde mit 100 %','perfects',1,55],
  ['notes5','Notizsammler','5 Notizen angelegt','notes',5,45],
  ['s20','20 Runden','20 Lernrunden abgeschlossen','sessions',20,70],
  ['st7','Eine Woche','7 Tage in Folge gelernt','streak',7,80],
  ['reviews10','Drangeblieben','10 Wiederholungen abgeschlossen','reviewsDone',10,65],
  ['xp1000','1.000 XP','1.000 XP gesammelt','xp',1000,100],
  ['perfect5','Präzise','5 fehlerfreie Runden','perfects',5,110],
  ['master5','Gefestigt','5 Inhalte bis Stufe 3 wiederholt','mastered',5,120],
  ['s50','50 Runden','50 Lernrunden abgeschlossen','sessions',50,130],
  ['st30','30 Tage','30 Tage in Folge gelernt','streak',30,190],
  ['xp5000','5.000 XP','5.000 XP gesammelt','xp',5000,220],
  ['s100','100 Runden','100 Lernrunden abgeschlossen','sessions',100,250]
].map(x=>({id:x[0],name:x[1],desc:x[2],metric:x[3],target:x[4],points:x[5]}));

function stats(){
  const p=data.profile(), rev=data.reviews();
  return {sessions:p.sessions||0,streak:p.streak||0,xp:p.xp||0,perfects:p.perfects||0,notes:data.notes().length,
    reviewsDone:p.reviewsDone||0,mastered:rev.filter(r=>(r.stage||0)>=3).length};
}
function evalTrophies(){
  const s=stats(), t=load(KEYS.trophies,{unlocked:{}}), fresh=[];
  TROPHIES.forEach(x=>{ if((s[x.metric]||0)>=x.target && !t.unlocked[x.id]){t.unlocked[x.id]=Date.now();fresh.push(x);} });
  save(KEYS.trophies,t); return fresh;
}
function trophyScore(){
  const t=load(KEYS.trophies,{unlocked:{}});
  return TROPHIES.reduce((a,x)=>a+(t.unlocked[x.id]?x.points:0),0);
}
function league(score){ return score>=900?'Platin':score>=450?'Gold':score>=180?'Silber':'Bronze'; }
function weekKey(ts=Date.now()){
  const d=new Date(ts), u=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
  const day=u.getUTCDay()||7; u.setUTCDate(u.getUTCDate()+4-day);
  const y=new Date(Date.UTC(u.getUTCFullYear(),0,1)); return u.getUTCFullYear()+'-W'+Math.ceil((((u-y)/86400000)+1)/7);
}
function recordActivity(kind){
  const rows=load(KEYS.activity,[]), day=dayKey(), w=weekKey(), row=rows.find(x=>x.day===day)||{day,week:w,sessions:0,reviews:0};
  if(!rows.includes(row)) rows.push(row);
  row[kind]=(row[kind]||0)+1; save(KEYS.activity,rows.slice(-180));
}
function weekStats(){
  const w=weekKey(); return load(KEYS.activity,[]).filter(x=>x.week===w).reduce((a,x)=>({sessions:a.sessions+(x.sessions||0),reviews:a.reviews+(x.reviews||0)}),{sessions:0,reviews:0});
}

const state = {
  screen:location.pathname==='/trophies'?'trophies':'home',
  noteId:data.notes()[0]?.id,
  pageId:data.notes()[0]?.pages?.[0]?.id,
  noteMode:'view', noteTool:'pen', penSize:5, markerSize:24, eraserSize:55, eraserMode:'precision', color:'#20242B',
  selection:null, history:{}, redo:{}, focus:false, noteNav:'pages', splitStudy:false, splitReveal:false, splitIndex:0, noteInfo:false, selectedImage:null, jumpStart:null, docSearchOpen:false, docSearchQuery:'', toolMenu:false,
  libraryTab:'notes', libraryView:'list', libraryQuery:'', librarySort:'recent', librarySubject:'all', libraryFolder:'all', newMenu:false, folderModal:false, folderModalMode:'create', folderEditId:null, folderMenu:false,
  recentColors:load('ss11:recentColors',['#20242B','#3568D4','#B75850','#26785B','#D39A23']),
  createMode:'photo', createText:'', createFile:null, createPreview:'', createError:'', challenge:null, q:0, answered:false, score:0, lastCorrect:false, lastExplanation:'', quizMode:'normal',
  toast:'', quickCreateOpen:false, pagesSheetOpen:false, sortSheetOpen:false, docContextId:null, moveSheetOpen:false, libraryOptionsOpen:false, pageActionsOpen:false, noteListQuery:'', editorReturn:'library'
};

function toast(msg){
  state.toast=msg; const old=$('.toast'); if(old) old.remove();
  const el=document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}
let saveStatusTimer=null;
function saveStatusPulse(){
  const s=$('#saveStatus');if(!s)return;
  s.textContent='Speichert…';
  clearTimeout(saveStatusTimer);
  saveStatusTimer=setTimeout(()=>{const el=$('#saveStatus');if(el)el.textContent='Gespeichert';},350);
}
function topbar(back=false){
  return '<header class="topbar">'+(back?'<button class="iconbtn" data-action="back">'+icon('back')+'</button>':'<button class="wordmark" data-action="home">SnapStudy</button>')+
    '<div class="spacer"></div><button class="trophy-pill" data-action="trophies">'+icon('trophy',15)+'<span>'+trophyScore()+'</span></button>'+
    '<button class="iconbtn" data-action="library">'+icon('search',17)+'</button></header>';
}
function nav(active){
  const items=[['home','Heute','home'],['notes','Notizen','note'],['reviews','Wiederholen','repeat'],['library','Sammlung','stack']];
  return '<nav class="bottomnav">'+items.map(x=>'<button data-action="'+x[0]+'" class="'+(active===x[0]?'active':'')+'">'+icon(x[2],18)+'<span>'+x[1]+'</span></button>').join('')+'</nav>';
}
function shell(content,active='home',opts={}){
  return '<main class="app '+(opts.wide?'wide':'')+'">'+(opts.noTop?'':topbar(!!opts.back))+'<div class="content">'+content+'</div>'+(opts.noNav?'':nav(active))+'</main>';
}

function getNote(){return data.notes().find(n=>n.id===state.noteId)||data.notes()[0];}
function getPage(n=getNote()){
  if(!n)return null;
  const pages=Array.isArray(n.pages)?n.pages:[];
  let p=pages.find(x=>x.id===state.pageId)||pages[0]||null;
  if(p&&state.pageId!==p.id)state.pageId=p.id;
  return p;
}
function patchPage(patch){
  const notes=data.notes().map(n=>n.id===state.noteId?Object.assign({},n,{pages:(n.pages||[]).map(p=>p.id===state.pageId?Object.assign({},p,patch):p),updatedAt:Date.now()}):n);
  data.setNotes(notes);saveStatusPulse();
}
function addPage(){
  const n=getNote();if(!n)return;
  const p={id:uid('page'),title:'Seite '+((n.pages?.length||0)+1),text:'',paper:'ruled',images:[],shapes:[],bookmark:false};
  data.setNotes(data.notes().map(x=>x.id===n.id?Object.assign({},x,{pages:[...(x.pages||[]),p],updatedAt:Date.now()}):x));
  state.pageId=p.id;state.noteMode='edit';renderNotes();
}
function duplicatePage(){
  const n=getNote(),p=getPage(n);if(!n||!p)return;
  const cp=JSON.parse(JSON.stringify(p));cp.id=uid('page');cp.title=(p.title||'Seite')+' Kopie';
  const pages=n.pages||[],idx=pages.findIndex(x=>x.id===p.id),next=pages.slice();next.splice(idx+1,0,cp);
  data.setNotes(data.notes().map(x=>x.id===n.id?Object.assign({},x,{pages:next,updatedAt:Date.now()}):x));
  data.setStrokes(n.id,cp.id,JSON.parse(JSON.stringify(data.strokes(n.id,p.id))));
  state.pageId=cp.id;renderNotes();
}
function deletePage(){
  const n=getNote(),p=getPage(n);if(!n||!p)return;
  if((n.pages||[]).length<=1){toast('Mindestens eine Seite muss bleiben');return;}
  const idx=n.pages.findIndex(x=>x.id===p.id),pages=n.pages.filter(x=>x.id!==p.id);
  data.setNotes(data.notes().map(x=>x.id===n.id?Object.assign({},x,{pages,updatedAt:Date.now()}):x));
  localStorage.removeItem('ss12:strokes:'+n.id+':'+p.id);state.pageId=pages[Math.max(0,idx-1)].id;renderNotes();
}
function movePage(direction){
  const n=getNote(),p=getPage(n);if(!n||!p)return;
  const pages=(n.pages||[]).slice(),i=pages.findIndex(x=>x.id===p.id),j=i+direction;
  if(i<0||j<0||j>=pages.length)return;
  const tmp=pages[i];pages[i]=pages[j];pages[j]=tmp;
  data.setNotes(data.notes().map(x=>x.id===n.id?Object.assign({},x,{pages,updatedAt:Date.now()}):x));
  renderNotes();
}
function noteOutline(page){
  const text=String(page?.text||''),lines=text.split('\n'),out=[];let pos=0;
  lines.forEach((raw,i)=>{const line=raw.trim(),start=pos;pos+=raw.length+1;if(!line)return;const heading=i===0||line.endsWith(':')||(/^[A-ZÄÖÜ0-9][^.!?]{2,55}$/u.test(line)&&!/[=+*/]/.test(line));if(heading&&out.length<12)out.push({label:line.replace(/:$/,''),start});});
  return out;
}
function subjectList(){return [...new Set(data.notes().map(n=>n.subject||'Ohne Fach'))].sort((a,b)=>a.localeCompare(b,'de'));}
function folderName(id){return data.folders().find(f=>f.id===id)?.name||'';}
function createFolder(name){
  name=String(name||'').trim();if(!name)return;
  const folder={id:uid('folder'),name,createdAt:Date.now()};data.setFolders([...data.folders(),folder]);state.libraryFolder=folder.id;state.folderModal=false;state.folderModalMode='create';renderLibrary();
}
function renameFolder(id,name){
  name=String(name||'').trim();if(!id||!name)return;
  data.setFolders(data.folders().map(f=>f.id===id?Object.assign({},f,{name}):f));
  state.folderModal=false;state.folderEditId=null;state.folderMenu=false;renderLibrary();
}
function deleteFolder(id){
  if(!id)return;
  data.setNotes(data.notes().map(n=>n.folderId===id?Object.assign({},n,{folderId:null,updatedAt:Date.now()}):n));
  data.setFolders(data.folders().filter(f=>f.id!==id));
  state.libraryFolder='all';state.folderMenu=false;renderLibrary();
}
function moveNoteToFolder(folderId){patchNote({folderId:folderId==='none'?null:folderId});}
function splitChallenge(n){
  const text=(n?.pages||[]).map(p=>p.text||'').join('\n').trim();
  return text.length>=20?localChallenge(text,n.title):null;
}
function markNoteForReview(){
  const n=getNote(),ch=splitChallenge(n);if(!ch||!ch.questions.length){toast('Das Dokument braucht etwas mehr Text');return;}addReview(ch.questions[0],ch,'note');toast('Für Wiederholung markiert');
}
function updateRecentColor(color){const next=[color,...state.recentColors.filter(c=>c!==color)].slice(0,5);state.recentColors=next;save('ss11:recentColors',next);}
function noteRow(n){
  const marks=(n.pinned?'<i class="pinmark">'+icon('pin',12)+'</i>':'')+(n.favorite?'<i class="fav">★</i>':'');
  const pages=(n.pages||[]).length;
  const location=folderName(n.folderId)||n.subject||'Ohne Fach';
  return '<article class="row"><button data-action="open-note" data-id="'+esc(n.id)+'">'+
    '<span class="fileicon">'+icon('note',17)+'</span>'+
    '<span class="rowcopy"><strong>'+esc(n.title||'Unbenannt')+'</strong><small>'+esc(location)+' · '+pages+' '+(pages===1?'Seite':'Seiten')+' · '+(n.updatedAt?fmtDate(n.updatedAt):'')+'</small></span>'+
    '</button><span class="rowmarks">'+marks+'</span></article>';
}
function roundRow(r){
  return '<article class="row"><button data-action="play-round" data-id="'+esc(r.id)+'"><span class="fileicon blue">'+icon('stack',17)+'</span><span class="rowcopy"><strong>'+esc(r.title||'Lernrunde')+'</strong><small>'+esc(r.topic||'')+' · '+(r.questions?.length||0)+' Fragen</small></span></button></article>';
}

function renderHome(){
  evalTrophies();
  const notes=data.notes().slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const pinned=notes.filter(n=>n.pinned).slice(0,3);
  const due=data.reviews().filter(r=>(r.dueAt||0)<=Date.now());
  const ws=weekStats(),score=trophyScore(),profile=data.profile();
  const dateLabel=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date());

  root.innerHTML=shell(
    '<section class="homehead"><div><h1>Heute</h1><span>'+esc(dateLabel)+'</span></div></section>'+
    '<section class="review-strip home-review"><div><strong>Wiederholen</strong><span>'+(due.length?due.length+' fällig':'Nichts fällig')+'</span></div>'+(due.length?'<button data-action="start-due">Starten</button>':'')+'</section>'+
    '<section class="section compact-section"><div class="sectionhead"><h2>Neu</h2></div>'+
      '<div class="homeactions">'+
        '<button data-action="new-note">'+icon('note',17)+'<span>Notiz</span></button>'+
        '<button data-action="create-photo">'+icon('camera',17)+'<span>Foto</span></button>'+
        '<button data-action="create-text">'+icon('text',17)+'<span>Text</span></button>'+
      '</div>'+
    '</section>'+
    (pinned.length?'<section class="section"><div class="sectionhead"><h2>Angepinnt</h2><button data-action="library-pinned">Alle</button></div><div class="rows">'+pinned.map(noteRow).join('')+'</div></section>':'')+
    '<section class="section"><div class="sectionhead"><h2>Zuletzt</h2><button data-action="library">Alle</button></div><div class="rows">'+(notes.length?notes.slice(0,5).map(noteRow).join(''):'<div class="emptyline">Keine Dokumente</div>')+'</div></section>'+
    '<section class="home-status">'+
      '<button data-action="trophies"><span>'+icon('trophy',15)+'</span><div><strong>'+league(score)+'</strong><small>'+score+' Pokalpunkte</small></div>'+icon('arrow',13)+'</button>'+
      '<div><span>Diese Woche</span><strong>'+ws.sessions+' Runden · '+ws.reviews+' Wiederholungen</strong></div>'+
      '<div><span>Serie</span><strong>'+(profile.streak||0)+' Tage</strong></div>'+
    '</section>',
    'home'
  );
}

function renderNotesList(){
  state.screen='noteslist';
  let notes=data.notes().slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const q=state.noteListQuery.trim().toLowerCase();
  if(q){
    notes=notes.filter(n=>{
      const text=(n.pages||[]).map(p=>p.text||'').join(' ');
      return (String(n.title||'')+' '+String(n.subject||'')+' '+text+' '+(n.tags||[]).join(' ')).toLowerCase().includes(q);
    });
  }
  const pinned=notes.filter(n=>n.pinned);
  const rest=notes.filter(n=>!n.pinned);
  const add='<button class="v14-circle" data-action="new-note-from-list" aria-label="Neue Notiz">'+icon('plus',21)+'</button>';
  let html=v14LargeNav('Notizen','',add)+
    '<label class="v14-search">'+icon('search',18)+'<input id="noteListSearch" placeholder="Notizen durchsuchen" value="'+esc(state.noteListQuery)+'"></label>';

  if(pinned.length){
    html+='<section class="v14-section">'+v14Section('Angepinnt')+'<div class="v14-list">'+pinned.map(v14DocRow).join('')+'</div></section>';
  }
  html+='<section class="v14-section">'+v14Section(q?'Ergebnisse':'Alle Notizen')+
    (rest.length?'<div class="v14-list">'+rest.map(v14DocRow).join('')+'</div>':(q?v14Empty('Keine Treffer','Versuche einen anderen Suchbegriff.'):v14Empty('Noch keine Notizen','Erstelle deine erste Notiz.','new-note-from-list','Neue Notiz')))+
  '</section>'+v14ContextSheet();

  root.innerHTML=shell(html,'notes');
  const search=$('#noteListSearch');
  if(search)search.oninput=e=>{const pos=e.target.selectionStart??e.target.value.length;state.noteListQuery=e.target.value;renderNotesList();v14RestoreInput('noteListSearch',pos);};
  requestAnimationFrame(()=>{v14BindLargeTitle();v14BindDocumentGestures();});
}

function renderLibrary(){
  let notes=data.notes(),rounds=data.rounds(),deleted=data.deleted(),folders=data.folders(),q=state.libraryQuery.trim().toLowerCase();
  if(state.libraryFolder!=='all')notes=notes.filter(n=>n.folderId===state.libraryFolder);
  if(state.librarySubject!=='all')notes=notes.filter(n=>(n.subject||'Ohne Fach')===state.librarySubject);
  if(q){
    notes=notes.filter(n=>{
      const text=(n.pages||[]).map(p=>p.text||'').join(' ');
      return (String(n.title||'')+' '+text+' '+String(n.subject||'')+' '+(n.tags||[]).join(' ')+' '+folderName(n.folderId)).toLowerCase().includes(q);
    });
    rounds=rounds.filter(r=>(String(r.title||'')+' '+String(r.topic||'')).toLowerCase().includes(q));
  }
  if(state.libraryTab==='favorites')notes=notes.filter(n=>n.favorite);
  if(state.libraryTab==='pinned')notes=notes.filter(n=>n.pinned);
  notes=notes.slice().sort((a,b)=>state.librarySort==='title'?String(a.title).localeCompare(String(b.title),'de'):(b.updatedAt||0)-(a.updatedAt||0));

  let body='';
  if(state.libraryTab==='rounds')body=rounds.length?'<div class="rows">'+rounds.map(roundRow).join('')+'</div>':'<div class="empty">Keine Lernrunden</div>';
  else if(state.libraryTab==='deleted')body=deleted.length?'<div class="rows">'+deleted.map(n=>'<article class="row deleted"><div><span class="fileicon">'+icon('trash',16)+'</span><span class="rowcopy"><strong>'+esc(n.title)+'</strong><small>Gelöscht '+fmtDate(n.deletedAt)+'</small></span></div><footer><button data-action="restore-note" data-id="'+n.id+'">Wiederherstellen</button><button data-action="purge-note" data-id="'+n.id+'">Löschen</button></footer></article>').join('')+'</div>':'<div class="empty">Papierkorb ist leer</div>';
  else{
    const folderRows=(state.libraryTab==='notes'&&state.libraryFolder==='all'&&!q&&folders.length)
      ?'<section class="foldersection"><div class="sectionhead"><h2>Ordner</h2><span>'+folders.length+'</span></div><div class="foldergrid">'+folders.map(f=>'<button data-action="open-folder" data-id="'+f.id+'"><span>'+icon('folder',18)+'</span><strong>'+esc(f.name)+'</strong><small>'+data.notes().filter(n=>n.folderId===f.id).length+' Dokumente</small></button>').join('')+'</div></section>'
      :'';
    const docs=state.libraryView==='grid'
      ?(notes.length?'<div class="docgrid">'+notes.map(n=>{const p=n.pages?.[0]||{};return'<button data-action="open-note" data-id="'+n.id+'"><span class="sheet '+esc(p.paper||'ruled')+'"></span><strong>'+esc(n.title)+'</strong><small>'+esc(n.subject||'')+(n.pinned?' · angepinnt':'')+'</small></button>'}).join('')+'</div>':'<div class="empty">Keine Dokumente</div>')
      :(notes.length?'<div class="rows">'+notes.map(noteRow).join('')+'</div>':'<div class="empty">Keine Dokumente</div>');
    body=folderRows+'<section class="documentssection"><div class="sectionhead"><h2>'+(state.libraryFolder==='all'?'Dokumente':esc(folderName(state.libraryFolder)))+'</h2><span>'+notes.length+'</span></div>'+docs+'</section>';
  }

  const subjects=subjectList(),crumb=state.libraryFolder!=='all'?'<button class="foldercrumb" data-action="all-folders">'+icon('back',13)+esc(folderName(state.libraryFolder))+'</button>':'';
  root.innerHTML=shell(
    '<section class="libraryhead"><div>'+crumb+'<h1>Sammlung</h1></div><div class="library-actions">'+(state.libraryFolder!=='all'?'<button data-action="folder-more" aria-label="Ordneroptionen">'+icon('more',15)+'</button>':'')+'<button data-action="library-new">'+icon('plus',14)+' Neu</button></div></section>'+
    '<label class="searchbar">'+icon('search',15)+'<input id="librarySearch" placeholder="Suchen" value="'+esc(state.libraryQuery)+'"></label>'+
    '<div class="tabs">'+[['notes','Notizen'],['pinned','Angepinnt'],['favorites','Favoriten'],['rounds','Lernrunden'],['deleted','Gelöscht']].map(x=>'<button data-action="library-tab" data-tab="'+x[0]+'" class="'+(state.libraryTab===x[0]?'active':'')+'">'+x[1]+'</button>').join('')+'</div>'+
    ((['notes','pinned','favorites'].includes(state.libraryTab))?'<div class="toolbarline"><select id="subjectSelect"><option value="all">Alle Fächer</option>'+subjects.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select><select id="sortSelect"><option value="recent">Zuletzt geändert</option><option value="title">Titel</option></select><button data-action="toggle-library-view">'+icon(state.libraryView==='list'?'grid':'list',15)+'</button><span></span><button data-action="backup">'+icon('download',13)+' Sichern</button><label>'+icon('upload',13)+' Import<input id="backupInput" type="file" accept="application/json"></label></div>':'')+
    body+
    (state.newMenu?'<div class="newmenu"><button data-action="new-note">'+icon('note',15)+' Dokument</button><button data-action="new-folder">'+icon('folder',15)+' Ordner</button></div>':'')+
    (state.folderMenu?'<div class="foldermenu"><button data-action="rename-folder">'+icon('text',14)+' Umbenennen</button><button data-action="delete-folder" class="danger">'+icon('trash',14)+' Ordner löschen</button></div>':'')+
    (state.folderModal?'<div class="info-modal"><div><header><strong>'+(state.folderModalMode==='rename'?'Ordner umbenennen':'Neuer Ordner')+'</strong><button data-action="close-folder-modal">'+icon('close',15)+'</button></header><label>Name<input id="folderNameInput" autocomplete="off" value="'+esc(state.folderModalMode==='rename'?folderName(state.folderEditId):'')+'" placeholder="Ordnername"></label><button class="primary full foldercreate" data-action="'+(state.folderModalMode==='rename'?'save-folder-name':'create-folder')+'">'+(state.folderModalMode==='rename'?'Speichern':'Erstellen')+'</button></div></div>':''),
    'library'
  );
  const search=$('#librarySearch');if(search)search.oninput=e=>{const pos=e.target.selectionStart??e.target.value.length;state.libraryQuery=e.target.value;renderLibrary();v14RestoreInput('librarySearch',pos);};
  const subject=$('#subjectSelect');if(subject){subject.value=state.librarySubject;subject.onchange=e=>{state.librarySubject=e.target.value;renderLibrary();};}
  const sort=$('#sortSelect');if(sort){sort.value=state.librarySort;sort.onchange=e=>{state.librarySort=e.target.value;renderLibrary();};}
  const bi=$('#backupInput');if(bi)bi.onchange=e=>restoreBackup(e.target.files?.[0]);
  if(state.folderModal)requestAnimationFrame(()=>$('#folderNameInput')?.focus());
}
function backup(){
  const payload={version:12,notes:data.notes(),folders:data.folders(),rounds:data.rounds(),reviews:data.reviews(),profile:data.profile(),deleted:data.deleted(),strokes:{}};
  data.notes().forEach(n=>(n.pages||[]).forEach(p=>payload.strokes[n.id+':'+p.id]=data.strokes(n.id,p.id)));
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='snapstudy-backup-'+dayKey()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800);
}
function restoreBackup(file){
  if(!file)return;const r=new FileReader();
  r.onload=()=>{try{
    const x=JSON.parse(r.result);if(!Array.isArray(x.notes))throw 0;
    data.setNotes(x.notes);data.setFolders(x.folders||[]);data.setRounds(x.rounds||[]);data.setReviews(x.reviews||[]);data.setProfile(x.profile||{});data.setDeleted(x.deleted||[]);
    normalizeDocumentsV12();
    Object.entries(x.strokes||{}).forEach(([key,v])=>{
      const parts=key.split(':');
      if(parts.length>=2){data.setStrokes(parts[0],parts[1],v);return;}
      const note=data.notes().find(n=>n.id===key),page=note?.pages?.[0];if(note&&page)data.setStrokes(note.id,page.id,v);
    });
    const first=data.notes()[0];state.noteId=first?.id;state.pageId=first?.pages?.[0]?.id;toast('Backup importiert');renderLibrary();
  }catch{toast('Backup ungültig');}};
  r.readAsText(file);
}
function newNote(){
  const page={id:uid('page'),title:'Seite 1',text:'',paper:'ruled',images:[],shapes:[],bookmark:false};
  const n={id:uid('note'),title:'Unbenannt',subject:'Physik',folderId:state.libraryFolder!=='all'?state.libraryFolder:null,tags:[],favorite:false,pinned:false,createdAt:Date.now(),updatedAt:Date.now(),pages:[page]};
  data.setNotes([n,...data.notes()]);state.noteId=n.id;state.pageId=page.id;state.noteMode='edit';state.screen='notes';renderNotes();
}
function patchNote(patch){
  const notes=data.notes().map(n=>n.id===state.noteId?Object.assign({},n,patch,{updatedAt:Date.now()}):n);data.setNotes(notes);
  saveStatusPulse();
}
function softDelete(id){
  const notes=data.notes(),i=notes.findIndex(n=>n.id===id);if(i<0){return;}
  const [n]=notes.splice(i,1);n.deletedAt=Date.now();data.setNotes(notes);data.setDeleted([n,...data.deleted()].slice(0,50));
  const next=notes[Math.max(0,i-1)]||null;state.noteId=next?.id;state.pageId=next?.pages?.[0]?.id;
  if(next)renderNotes();else{state.screen='library';renderLibrary();}
}
function restoreNote(id){
  const del=data.deleted(),i=del.findIndex(n=>n.id===id);if(i<0)return;
  const [n]=del.splice(i,1);delete n.deletedAt;n.updatedAt=Date.now();data.setDeleted(del);data.setNotes([n,...data.notes()]);renderLibrary();
}
function purgeNote(id){
  const n=data.deleted().find(x=>x.id===id);if(n)(n.pages||[]).forEach(p=>localStorage.removeItem('ss12:strokes:'+id+':'+p.id));
  data.setDeleted(data.deleted().filter(n=>n.id!==id));renderLibrary();
}
function duplicateNote(){
  const n=getNote();if(!n)return;
  const copy=JSON.parse(JSON.stringify(n)),map={};copy.id=uid('note');copy.title=(n.title||'Dokument')+' Kopie';copy.favorite=false;copy.pinned=false;copy.createdAt=copy.updatedAt=Date.now();
  copy.pages=(copy.pages||[]).map(p=>{const old=p.id,np=Object.assign({},p,{id:uid('page')});map[old]=np.id;return np;});
  data.setNotes([copy,...data.notes()]);
  (n.pages||[]).forEach(p=>data.setStrokes(copy.id,map[p.id],JSON.parse(JSON.stringify(data.strokes(n.id,p.id)))));
  state.noteId=copy.id;state.pageId=copy.pages[0]?.id;renderNotes();
}

function renderNotes(){
  const n=getNote();
  if(!n){
    state.screen='library';
    renderLibrary();
    return;
  }
  const pages=Array.isArray(n.pages)?n.pages:[];
  const p=getPage(n);
  if(!p){
    addPage();
    return;
  }

  const pageIndex=pages.findIndex(x=>x.id===p.id);
  const outline=noteOutline(p);
  const split=splitChallenge(n);
  const splitQuestion=split?.questions?.length ? split.questions[state.splitIndex%split.questions.length] : null;
  const palette=state.recentColors.slice(0,5);
  const folders=data.folders();
  const searchTerm=state.docSearchQuery.trim().toLowerCase();
  const searchResults=searchTerm?pages.flatMap((pg,i)=>{
    const hay=String(pg.text||'').toLowerCase(),hits=[];
    let from=0,index=hay.indexOf(searchTerm,from),guard=0;
    while(index>=0&&guard<12){
      hits.push({pageId:pg.id,page:i+1,start:index,snippet:String(pg.text||'').slice(Math.max(0,index-28),Math.min(String(pg.text||'').length,index+searchTerm.length+50)).replace(/\n+/g,' ')});
      from=index+Math.max(1,searchTerm.length);index=hay.indexOf(searchTerm,from);guard++;
    }
    return hits;
  }).slice(0,20):[];

  const pageNav=pages.map((pg,i)=>
    '<button data-action="open-page" data-id="'+esc(pg.id)+'" class="'+(pg.id===p.id?'active':'')+'">'+
      '<span class="mini-sheet '+esc(pg.paper||'ruled')+'"></span>'+
      '<small>'+(pg.bookmark?'★ ':'')+esc(pg.title||('Seite '+(i+1)))+'</small>'+
    '</button>'
  ).join('')+(state.noteMode==='edit'
    ?'<button class="addpage" data-action="add-page">'+icon('plus',16)+'<small>Seite</small></button>'
    :'');

  const outlineNav=outline.length
    ?outline.map(x=>'<button data-action="jump-outline" data-start="'+x.start+'">'+esc(x.label)+'</button>').join('')
    :'<small>Keine Überschriften</small>';

  const navBlock=state.noteNav==='outline'
    ?'<aside class="outlinebar">'+outlineNav+'</aside>'
    :'<aside class="pagestrip">'+pageNav+'</aside>';

  let toolbar='';
  if(!state.focus&&state.noteMode==='edit'){
    const tools=[['pen','pen'],['marker','marker'],['eraser','eraser'],['select','select'],['text','text']];
    toolbar=
      '<div class="notetools">'+
        tools.map(x=>'<button title="'+x[0]+'" data-action="note-tool" data-tool="'+x[0]+'" class="'+(state.noteTool===x[0]?'active':'')+'">'+icon(x[1],17)+'</button>').join('')+
        '<i></i>'+
        palette.map(col=>'<button data-action="note-color" data-color="'+col+'" class="color '+(state.color===col?'active':'')+'" style="--c:'+col+'"></button>').join('')+
        '<label class="customcolor" title="Farbe"><span>+</span><input id="customColor" type="color" value="'+esc(state.color)+'"></label>'+
        '<span></span>'+
        '<button data-action="undo" aria-label="Rückgängig">'+icon('undo',16)+'</button>'+
        '<button data-action="redo" aria-label="Wiederholen">'+icon('redo',16)+'</button>'+
        '<button data-action="toggle-tool-menu" class="'+(state.toolMenu?'active':'')+'" aria-label="Einfügen">'+icon('plus',17)+'</button>'+
      '</div>'+
      (state.toolMenu?'<div class="toolmenu"><button data-action="note-tool" data-tool="shape">'+icon('shape',16)+'<span>Form</span></button><label>'+icon('image',16)+'<span>Bild</span><input id="imageInput" type="file" accept="image/*"></label></div>':'')+
      toolOptions();
  }

  const viewBar=state.noteMode==='view'
    ?'<div class="viewbar">'+
       '<button data-action="prev-page" '+(pageIndex<=0?'disabled':'')+'>'+icon('back',14)+' Vorherige</button>'+
       '<span>Seite '+(pageIndex+1)+' / '+pages.length+'</span>'+
       '<button data-action="next-page" '+(pageIndex>=pages.length-1?'disabled':'')+'>Nächste '+icon('arrow',14)+'</button>'+
     '</div>'
    :'';

  let splitPane='';
  if(state.splitStudy&&splitQuestion){
    splitPane=
      '<aside class="splitpane">'+
        '<header><div><small>Lernansicht</small><strong>'+esc(n.title)+'</strong></div><button data-action="toggle-split">'+icon('close',14)+'</button></header>'+
        '<p>'+esc(splitQuestion.prompt)+'</p>'+
        (state.splitReveal
          ?'<div class="splitanswer">'+esc((splitQuestion.accepted&&splitQuestion.accepted[0])||splitQuestion.explanation||'')+'</div>'
          :'<button class="splitreveal" data-action="split-reveal">Antwort anzeigen</button>')+
        '<footer><button data-action="split-next">Weiter</button><button data-action="split-full">Runde öffnen</button></footer>'+
      '</aside>';
  }

  const images=(p.images||[]).map(img=>
    '<img data-image-id="'+esc(img.id)+'" class="'+(state.selectedImage===img.id?'selected':'')+'" src="'+img.src+'" style="left:'+img.x+'%;top:'+img.y+'%;width:'+img.w+'%;">'
  ).join('');

  let canvasContextMenu='';
  if(state.selection&&state.selection.noteId===n.id&&state.selection.pageId===p.id&&state.selection.ids.length){
    const selectedStrokes=data.strokes(n.id,p.id).filter(s=>state.selection.ids.includes(s.id));
    const points=selectedStrokes.flatMap(s=>s.points||[]);
    if(points.length){
      const xs=points.map(q=>q.x),ys=points.map(q=>q.y);
      const left=Math.max(12,Math.min(88,((Math.min(...xs)+Math.max(...xs))/2)/10));
      const top=Math.max(5,Math.min(92,(Math.min(...ys)/14)-1));
      canvasContextMenu='<div class="contextbar" style="left:'+left+'%;top:'+top+'%">'+
        '<span>'+state.selection.ids.length+' ausgewählt</span>'+
        '<button data-action="copy-selection">'+icon('copy',13)+'</button>'+
        '<button data-action="recolor-selection"><i style="background:'+state.color+'"></i></button>'+
        '<button data-action="delete-selection" class="danger">'+icon('trash',13)+'</button>'+
      '</div>';
    }
  }
  const selectedImg=(p.images||[]).find(img=>img.id===state.selectedImage);
  if(selectedImg){
    const left=Math.max(12,Math.min(88,(selectedImg.x||0)+(selectedImg.w||35)/2));
    const top=Math.max(5,(selectedImg.y||0)-1);
    canvasContextMenu='<div class="contextbar image-context" style="left:'+left+'%;top:'+top+'%">'+
      '<span>Bild</span><button data-action="image-smaller">−</button><button data-action="image-larger">+</button><button data-action="image-delete" class="danger">'+icon('trash',13)+'</button>'+
    '</div>';
  }

  const documentSearch=state.docSearchOpen
    ?'<section class="docsearch"><label>'+icon('search',15)+'<input id="docSearchInput" value="'+esc(state.docSearchQuery)+'" placeholder="Im Dokument suchen"></label>'+
      (searchTerm
        ?'<div class="docsearch-results">'+(searchResults.length
          ?searchResults.map(r=>'<button data-action="doc-search-result" data-page="'+esc(r.pageId)+'" data-start="'+r.start+'"><strong>Seite '+r.page+'</strong><span>'+esc(r.snippet)+'</span></button>').join('')
          :'<small>Keine Treffer</small>')+'</div>'
        :'')+
     '</section>'
    :'';

  const footer=!state.focus
    ?'<footer class="notefoot">'+
       '<button data-action="note-info">'+esc(n.subject||'Ohne Fach')+'</button>'+
       '<button data-action="template-menu">'+paperName(p.paper)+'</button>'+
       '<span class="grow"></span>'+
       '<button data-action="page-more">'+icon('more',13)+'<span>Seite</span></button>'+
       '<button data-action="toggle-split">'+icon('stack',13)+'<span>Split</span></button>'+
       '<button data-action="export-note">'+icon('download',13)+'<span>Export</span></button>'+
       '<button class="learn-button" data-action="note-study">'+icon('play',13)+'<span>Lernen</span></button>'+
       '<button data-action="note-more" aria-label="Mehr">'+icon('more',14)+'</button>'+
     '</footer>'
    :'';

  const noteMenu=
    '<div id="noteMenu" class="popover hidden">'+
      '<button data-action="mark-note-review">'+icon('repeat',14)+' Wiederholen</button>'+
      '<button data-action="note-info">'+icon('note',14)+' Details</button>'+
      '<button data-action="duplicate-note">'+icon('copy',14)+' Dokument duplizieren</button>'+
      '<button data-action="delete-note" class="danger">'+icon('trash',14)+' Dokument löschen</button>'+
    '</div>';

  const pageMenu=
    '<div id="pageMenu" class="popover page-menu hidden">'+
      '<button data-action="bookmark-page">'+icon('star',14)+(p.bookmark?' Lesezeichen entfernen':' Lesezeichen')+'</button>'+
      '<button data-action="page-left">'+icon('back',14)+' Nach links</button>'+
      '<button data-action="page-right">'+icon('arrow',14)+' Nach rechts</button>'+
      '<button data-action="duplicate-page">'+icon('copy',14)+' Seite duplizieren</button>'+
      '<button data-action="delete-page" class="danger">'+icon('trash',14)+' Seite löschen</button>'+
    '</div>';

  const templateMenu=
    '<div id="templateMenu" class="template-modal hidden"><div>'+
      '<header><strong>Seitenvorlage</strong><button data-action="close-template">'+icon('close',15)+'</button></header>'+
      '<section>'+
        ['plain','ruled','grid','dotted','cornell'].map(kind=>
          '<button data-action="set-paper" data-paper="'+kind+'" class="'+(p.paper===kind?'active':'')+'">'+
            '<span class="template '+kind+'"></span><small>'+paperName(kind)+'</small>'+
          '</button>'
        ).join('')+
      '</section>'+
    '</div></div>';

  let infoModal='';
  if(state.noteInfo){
    infoModal=
      '<div class="info-modal"><div>'+
        '<header><strong>Dokument</strong><button data-action="close-note-info">'+icon('close',15)+'</button></header>'+
        '<label>Titel<input id="infoTitle" value="'+esc(n.title)+'"></label>'+
        '<label>Fach<select id="infoSubject"><option>Physik</option><option>Mathe</option><option>Geografie</option><option>Englisch</option><option>Sonstige</option></select></label>'+
        '<label>Ordner<select id="infoFolder"><option value="none">Kein Ordner</option>'+folders.map(f=>'<option value="'+esc(f.id)+'">'+esc(f.name)+'</option>').join('')+'</select></label>'+
        '<label>Tags<input id="infoTags" value="'+esc((n.tags||[]).join(', '))+'" placeholder="z. B. Klausur, Q1"></label>'+
        '<div class="info-actions">'+
          '<button data-action="pin-note">'+icon('pin',14)+(n.pinned?' Loslösen':' Anpinnen')+'</button>'+
          '<button data-action="favorite-note">'+icon('star',14)+(n.favorite?' Entfernen':' Favorit')+'</button>'+
        '</div>'+
      '</div></div>';
  }



  const html=
    '<section class="noteshell '+(state.focus?'focus ':'')+(state.noteMode==='view'?'view':'edit')+'">'+
      '<header class="notehead">'+
        '<button class="iconbtn" data-action="home">'+icon('back',17)+'</button>'+
        '<div class="notetitle"><span>'+esc(n.subject||'Notizen')+' · <i id="saveStatus">Gespeichert</i></span><input id="noteTitle" '+(state.noteMode==='view'?'readonly':'')+' value="'+esc(n.title)+'"></div>'+
        '<div class="modes"><button data-action="note-mode" data-mode="edit" class="'+(state.noteMode==='edit'?'active':'')+'">Bearbeiten</button><button data-action="note-mode" data-mode="view" class="'+(state.noteMode==='view'?'active':'')+'">Ansicht</button></div>'+
        '<button class="iconbtn '+(state.docSearchOpen?'blueicon':'')+'" data-action="toggle-doc-search" aria-label="Suchen">'+icon('search',16)+'</button>'+
        '<button class="iconbtn '+(n.pinned?'blueicon':'')+'" data-action="pin-note" aria-label="Anpinnen">'+icon('pin',16)+'</button>'+
        '<button class="iconbtn '+(n.favorite?'gold':'')+'" data-action="favorite-note" aria-label="Favorit">'+icon('star',16)+'</button>'+
        '<button class="iconbtn" data-action="focus-note" aria-label="Fokus">'+icon('fit',16)+'</button>'+
      '</header>'+
      documentSearch+
      (!state.focus
        ?'<div class="notenavtabs"><button data-action="note-nav" data-nav="pages" class="'+(state.noteNav==='pages'?'active':'')+'">Seiten</button><button data-action="note-nav" data-nav="outline" class="'+(state.noteNav==='outline'?'active':'')+'">Inhalt</button></div>'+navBlock
        :'')+
      '<main class="noteeditor">'+
        toolbar+
        viewBar+
        splitPane+
        '<div class="paperstage"><div class="paper '+esc(p.paper||'ruled')+'">'+
          '<textarea id="noteText" '+(state.noteMode==='view'?'readonly':'')+' class="'+(state.noteMode==='edit'&&state.noteTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(p.text||'')+'</textarea>'+
          '<canvas id="noteCanvas" width="1000" height="1400"></canvas>'+
          '<div id="imageLayer">'+images+'</div>'+
          canvasContextMenu+
        '</div></div>'+
        footer+
      '</main>'+
      noteMenu+pageMenu+templateMenu+infoModal+
    '</section>';

  root.innerHTML=shell(html,'notes',{wide:true,noTop:true,noNav:state.focus});

  const infoSubject=$('#infoSubject');
  if(infoSubject){
    infoSubject.value=n.subject||'Physik';
    infoSubject.onchange=e=>patchNote({subject:e.target.value});
  }
  const infoFolder=$('#infoFolder');
  if(infoFolder){
    infoFolder.value=n.folderId||'none';
    infoFolder.onchange=e=>moveNoteToFolder(e.target.value);
  }
  const infoTags=$('#infoTags');
  if(infoTags)infoTags.onchange=e=>patchNote({tags:e.target.value.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12)});
  const infoTitle=$('#infoTitle');
  if(infoTitle)infoTitle.oninput=e=>{
    patchNote({title:e.target.value});
    const t=$('#noteTitle');
    if(t)t.value=e.target.value;
  };
  const docSearchInput=$('#docSearchInput');
  if(docSearchInput){
    docSearchInput.oninput=e=>{state.docSearchQuery=e.target.value;renderNotes();};
    requestAnimationFrame(()=>{const x=$('#docSearchInput');if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length);}});
  }
  const custom=$('#customColor');
  if(custom)custom.oninput=e=>{
    state.color=e.target.value;
    updateRecentColor(state.color);
    renderNotes();
  };

  bindNote(n,p);

  if(state.jumpStart!==null){
    requestAnimationFrame(()=>{
      const t=$('#noteText');
      if(!t)return;
      const cursor=state.jumpStart;
      state.jumpStart=null;
      state.noteMode='edit';
      state.noteTool='text';
      t.readOnly=false;
      t.classList.add('editing');
      t.focus();
      t.setSelectionRange(cursor,cursor);
    });
  }
}
function paperName(p){return ({plain:'Blanko',ruled:'Liniert',grid:'Kariert',dotted:'Punktiert',cornell:'Cornell'})[p]||'Liniert';}
function toolOptions(){
  if(state.noteTool==='pen')return '<div class="toolopts"><span>Stift</span><div class="presetdots">'+[3,6,10].map(v=>'<button data-action="pen-size" data-size="'+v+'" class="'+(state.penSize===v?'active':'')+'"><i style="width:'+Math.max(5,v)+'px;height:'+Math.max(5,v)+'px"></i></button>').join('')+'</div><input id="penSize" type="range" min="2" max="16" value="'+state.penSize+'"><b>'+state.penSize+'</b></div>';
  if(state.noteTool==='marker')return '<div class="toolopts"><span>Marker</span><div class="presetdots">'+[18,28,42].map(v=>'<button data-action="marker-size" data-size="'+v+'" class="'+(state.markerSize===v?'active':'')+'"><i class="marker-dot" style="width:'+Math.max(10,v/2)+'px"></i></button>').join('')+'</div><input id="markerSize" type="range" min="12" max="60" value="'+state.markerSize+'"><b>'+state.markerSize+'</b></div>';
  if(state.noteTool==='eraser')return '<div class="toolopts"><span>Radierer</span><div class="erasermodes"><button data-action="eraser-mode" data-mode="precision" class="'+(state.eraserMode==='precision'?'active':'')+'">Präzise</button><button data-action="eraser-mode" data-mode="stroke" class="'+(state.eraserMode==='stroke'?'active':'')+'">Strich</button></div>'+[30,55,90].map(v=>'<button data-action="eraser-size" data-size="'+v+'" class="'+(state.eraserSize===v?'active':'')+'">'+(v===30?'S':v===55?'M':'L')+'</button>').join('')+'</div>';
  if(state.noteTool==='shape')return '<div class="toolopts"><span>Form</span><button data-action="shape-kind" data-kind="line" class="'+((state.shapeKind||'line')==='line'?'active':'')+'">Linie</button><button data-action="shape-kind" data-kind="rect" class="'+(state.shapeKind==='rect'?'active':'')+'">Rechteck</button><button data-action="shape-kind" data-kind="ellipse" class="'+(state.shapeKind==='ellipse'?'active':'')+'">Ellipse</button></div>';
  if(state.noteTool==='select')return '<div class="toolopts"><span>Lasso</span><small>Bereich wählen und direkt verschieben, kopieren oder färben.</small></div>';
  return '<div class="toolopts"><span>'+state.noteTool.charAt(0).toUpperCase()+state.noteTool.slice(1)+'</span></div>';
}
function bindNote(n,p){
  const title=$('#noteTitle'),text=$('#noteText'),canvas=$('#noteCanvas'),ctx=canvas?.getContext('2d'),images=$$('#imageLayer img');
  if(title&&!title.readOnly)title.oninput=e=>patchNote({title:e.target.value});
  if(text&&!text.readOnly)text.oninput=e=>patchPage({text:e.target.value});
  const ps=$('#penSize');if(ps)ps.oninput=e=>{state.penSize=+e.target.value;const b=$('.toolopts b');if(b)b.textContent=e.target.value;};
  const ms=$('#markerSize');if(ms)ms.oninput=e=>{state.markerSize=+e.target.value;const b=$('.toolopts b');if(b)b.textContent=e.target.value;};
  const imgInput=$('#imageInput');if(imgInput)imgInput.onchange=e=>addImageToNote(e.target.files?.[0]);
  if(!canvas||!ctx)return;
  let strokes=data.strokes(n.id,p.id),drawing=false,current=null,start=null,lasso=null,moveBase=null,moveOrigin=null;

  const pos=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1000,y:(e.clientY-r.top)/r.height*1400};};
  const boundsForIds=(items,ids)=>{
    const pts=items.filter(s=>ids.includes(s.id)).flatMap(s=>s.points||[]);
    if(!pts.length)return null;
    const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);
    return{x:Math.min(...xs)-12,y:Math.min(...ys)-12,w:Math.max(...xs)-Math.min(...xs)+24,h:Math.max(...ys)-Math.min(...ys)+24};
  };
  const selectionBox=()=>state.selection&&state.selection.noteId===n.id&&state.selection.pageId===p.id?boundsForIds(strokes,state.selection.ids):null;
  const renderCanvas=()=>{
    ctx.clearRect(0,0,1000,1400);
    (p.shapes||[]).forEach(s=>{ctx.save();ctx.strokeStyle=s.color;ctx.lineWidth=s.width||5;ctx.beginPath();if(s.kind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);}else if(s.kind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1));}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2);}ctx.stroke();ctx.restore();});
    strokes.forEach(s=>{if(!s.points?.length)return;ctx.save();ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=s.tool==='marker'?.32:1;ctx.stroke();ctx.restore();});
    const box=lasso||selectionBox();if(box){ctx.save();ctx.strokeStyle='#3568D4';ctx.fillStyle='rgba(53,104,212,.025)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.restore();}
  };
  const segDist=(q,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;if(!l)return Math.hypot(q.x-a.x,q.y-a.y);let t=((q.x-a.x)*dx+(q.y-a.y)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(q.x-(a.x+t*dx),q.y-(a.y+t*dy));};
  const hit=(s,q,r)=>{for(let i=1;i<s.points.length;i++)if(segDist(q,s.points[i-1],s.points[i])<=r+(s.width||0)/2)return true;return false;};
  const precisionErase=(items,q,r)=>{
    const out=[];
    items.forEach(stroke=>{
      const pts=stroke.points||[];
      if(pts.length<2){if(!pts.length||Math.hypot(pts[0].x-q.x,pts[0].y-q.y)>r)out.push(stroke);return;}
      let segment=[];
      const flush=()=>{if(segment.length>1)out.push(Object.assign({},stroke,{id:uid('s'),points:segment}));segment=[];};
      pts.forEach(pt=>{
        if(Math.hypot(pt.x-q.x,pt.y-q.y)<=r){flush();}
        else segment.push(pt);
      });
      flush();
    });
    return out;
  };
  const eraseAt=(items,q)=>state.eraserMode==='stroke'?items.filter(s=>!hit(s,q,state.eraserSize)):precisionErase(items,q,state.eraserSize*.55);
  const historyKey=n.id+':'+p.id;
  const snapshot=()=>{(state.history[historyKey]||(state.history[historyKey]=[])).push(JSON.stringify(strokes));state.history[historyKey]=state.history[historyKey].slice(-30);state.redo[historyKey]=[];};
  const events=e=>{if(e.getCoalescedEvents){const a=e.getCoalescedEvents();if(a.length)return a.map(pos);}return[pos(e)];};
  const inside=(q,b)=>b&&q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h;

  renderCanvas();
  if(state.noteMode==='view'){canvas.style.pointerEvents='none';return;}
  canvas.onpointerdown=e=>{
    e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const q=pos(e);start=q;
    if(state.noteTool==='eraser'){snapshot();strokes=eraseAt(strokes,q);data.setStrokes(n.id,p.id,strokes);renderCanvas();return;}
    if(state.noteTool==='select'){
      const box=selectionBox();
      if(inside(q,box)&&state.selection?.ids?.length){snapshot();moveBase=JSON.parse(JSON.stringify(strokes));moveOrigin=q;lasso=null;return;}
      state.selection=null;lasso={x:q.x,y:q.y,w:0,h:0};renderCanvas();return;
    }
    if(state.noteTool==='shape'){state.shapeStart=q;return;}
    if(state.noteTool==='text')return;
    snapshot();current={id:uid('s'),tool:state.noteTool==='marker'?'marker':'pen',color:state.noteTool==='marker'?'#E3B53C':state.color,width:state.noteTool==='marker'?state.markerSize:state.penSize,points:[q]};strokes.push(current);renderCanvas();
  };
  canvas.onpointermove=e=>{
    if(!drawing)return;const pts=events(e),q=pts[pts.length-1];
    if(state.noteTool==='eraser'){let changed=false;pts.forEach(v=>{const before=JSON.stringify(strokes);strokes=eraseAt(strokes,v);changed=changed||before!==JSON.stringify(strokes);});if(changed){data.setStrokes(n.id,p.id,strokes);renderCanvas();}return;}
    if(state.noteTool==='select'&&moveBase&&moveOrigin){
      const dx=q.x-moveOrigin.x,dy=q.y-moveOrigin.y,ids=state.selection.ids;
      strokes=moveBase.map(s=>ids.includes(s.id)?Object.assign({},s,{points:(s.points||[]).map(v=>({x:v.x+dx,y:v.y+dy}))}):s);renderCanvas();return;
    }
    if(state.noteTool==='select'&&start){lasso={x:Math.min(start.x,q.x),y:Math.min(start.y,q.y),w:Math.abs(q.x-start.x),h:Math.abs(q.y-start.y)};renderCanvas();return;}
    if(current){current.points.push(...pts);renderCanvas();}
  };
  canvas.onpointerup=e=>{
    const q=pos(e);drawing=false;
    if(state.noteTool==='shape'&&state.shapeStart){const a=state.shapeStart,shape={id:uid('shape'),kind:state.shapeKind||'line',x1:a.x,y1:a.y,x2:q.x,y2:q.y,color:state.color,width:state.penSize};patchPage({shapes:[...(p.shapes||[]),shape]});state.shapeStart=null;state.noteTool='select';renderNotes();return;}
    if(state.noteTool==='select'&&moveBase){data.setStrokes(n.id,p.id,strokes);moveBase=null;moveOrigin=null;start=null;renderNotes();return;}
    if(state.noteTool==='select'&&lasso){
      const ids=strokes.filter(s=>{const pts=s.points||[];if(!pts.length)return false;const xs=pts.map(x=>x.x),ys=pts.map(x=>x.y),b={x:Math.min(...xs),y:Math.min(...ys),r:Math.max(...xs),b:Math.max(...ys)};return !(b.x>lasso.x+lasso.w||b.r<lasso.x||b.y>lasso.y+lasso.h||b.b<lasso.y);}).map(s=>s.id);
      state.selection=ids.length?{noteId:n.id,pageId:p.id,ids}:null;lasso=null;start=null;renderNotes();return;
    }
    if(current){data.setStrokes(n.id,p.id,strokes);current=null;patchPage({});}
  };
  images.forEach(img=>{
    if(state.noteMode==='view')return;
    let drag=null;
    img.onpointerdown=e=>{e.preventDefault();e.stopPropagation();state.selectedImage=img.dataset.imageId;drag={x:e.clientX,y:e.clientY,left:parseFloat(img.style.left),top:parseFloat(img.style.top)};img.setPointerCapture(e.pointerId);};
    img.onpointermove=e=>{if(!drag)return;const paper=img.closest('.paper').getBoundingClientRect(),dx=(e.clientX-drag.x)/paper.width*100,dy=(e.clientY-drag.y)/paper.height*100;img.style.left=Math.max(0,Math.min(92,drag.left+dx))+'%';img.style.top=Math.max(0,Math.min(92,drag.top+dy))+'%';};
    img.onpointerup=()=>{if(!drag)return;const id=img.dataset.imageId,arr=(p.images||[]).map(x=>x.id===id?Object.assign({},x,{x:parseFloat(img.style.left),y:parseFloat(img.style.top)}):x);patchPage({images:arr});drag=null;renderNotes();};
  });
}
function deleteSelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId||sel.pageId!==state.pageId)return;
  const strokes=data.strokes(state.noteId,state.pageId).filter(s=>!sel.ids.includes(s.id));
  data.setStrokes(state.noteId,state.pageId,strokes);state.selection=null;renderNotes();
}
function copySelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId||sel.pageId!==state.pageId)return;
  const strokes=data.strokes(state.noteId,state.pageId),copies=strokes.filter(s=>sel.ids.includes(s.id)).map(s=>Object.assign({},s,{id:uid('s'),points:(s.points||[]).map(p=>({x:p.x+35,y:p.y+35}))}));
  data.setStrokes(state.noteId,state.pageId,strokes.concat(copies));state.selection={noteId:state.noteId,pageId:state.pageId,ids:copies.map(s=>s.id)};renderNotes();
}
function recolorSelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId||sel.pageId!==state.pageId)return;
  data.setStrokes(state.noteId,state.pageId,data.strokes(state.noteId,state.pageId).map(s=>sel.ids.includes(s.id)?Object.assign({},s,{color:state.color}):s));renderNotes();
}
function resizeSelectedImage(factor){
  const p=getPage(),id=state.selectedImage;if(!p||!id)return;
  patchPage({images:(p.images||[]).map(x=>x.id===id?Object.assign({},x,{w:Math.max(10,Math.min(80,(x.w||35)*factor))}):x)});renderNotes();
}
function deleteSelectedImage(){
  const p=getPage(),id=state.selectedImage;if(!p||!id)return;
  patchPage({images:(p.images||[]).filter(x=>x.id!==id)});state.selectedImage=null;renderNotes();
}
function addImageToNote(file){
  if(!file)return;const r=new FileReader();r.onload=()=>{const p=getPage(),id=uid('img'),arr=[...(p?.images||[]),{id,src:String(r.result),x:20,y:30,w:35}];patchPage({images:arr});state.noteTool='select';state.selectedImage=id;renderNotes();};r.readAsDataURL(file);
}
function undo(){
  const key=state.noteId+':'+state.pageId,st=data.strokes(state.noteId,state.pageId),h=state.history[key]||[];if(!h.length)return;
  const prev=h.pop();(state.redo[key]||(state.redo[key]=[])).push(JSON.stringify(st));data.setStrokes(state.noteId,state.pageId,JSON.parse(prev));renderNotes();
}
function redo(){
  const key=state.noteId+':'+state.pageId,r=state.redo[key]||[];if(!r.length)return;
  const next=r.pop();(state.history[key]||(state.history[key]=[])).push(JSON.stringify(data.strokes(state.noteId,state.pageId)));data.setStrokes(state.noteId,state.pageId,JSON.parse(next));renderNotes();
}
function exportNote(){
  const n=getNote(),p=getPage(n);if(!n||!p)return;
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1400;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fffefb';ctx.fillRect(0,0,1000,1400);ctx.fillStyle='#242830';ctx.font='26px Roboto,Arial';
  String(p.text||'').split('\n').forEach((line,i)=>ctx.fillText(line,70,70+i*42,850));
  (p.shapes||[]).forEach(s=>{ctx.save();ctx.strokeStyle=s.color;ctx.lineWidth=s.width||5;ctx.beginPath();if(s.kind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);}else if(s.kind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1));}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2);}ctx.stroke();ctx.restore();});
  data.strokes(n.id,p.id).forEach(s=>{if(!s.points?.length)return;ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.tool==='marker'?.32:1;ctx.lineCap='round';ctx.stroke();ctx.globalAlpha=1;});
  const a=document.createElement('a');a.download=(n.title||'Dokument')+'-'+(p.title||'Seite')+'.png';a.href=canvas.toDataURL('image/png');a.click();
}

function renderReviews(){
  const all=data.reviews().slice().sort((a,b)=>(a.dueAt||0)-(b.dueAt||0)),due=all.filter(r=>(r.dueAt||0)<=Date.now()),later=all.filter(r=>(r.dueAt||0)>Date.now());
  root.innerHTML=shell('<section class="pagehead"><h1>Wiederholen</h1></section>'+
    (due.length?'<section class="section"><div class="sectionhead"><h2>Heute</h2><span>'+due.length+'</span></div><div class="reviewrows">'+due.map(reviewRow).join('')+'</div><button class="primary full" data-action="start-due">Starten</button></section>':'<div class="empty compact">Nichts fällig</div>')+
    (later.length?'<section class="section"><div class="sectionhead"><h2>Später</h2><span>'+later.length+'</span></div><div class="reviewrows">'+later.map(reviewRow).join('')+'</div></section>':''),
    'reviews');
}
function reviewRow(r){return '<article><span class="dot"></span><div><strong>'+esc(r.prompt)+'</strong><small>'+esc(r.sourceTitle||'Lernrunde')+' · Stufe '+(r.stage||0)+'</small></div><time>'+fmtDate(r.dueAt)+'</time></article>';}
function addReview(q,challenge,reason='wrong'){
  const list=data.reviews(),key=(challenge.title||'')+'|'+q.prompt,old=list.find(x=>x.key===key);
  const item={key,prompt:q.prompt,choices:q.choices||[],accepted:q.accepted||[],explanation:q.explanation||'',sourceTitle:challenge.title||'Lernrunde',stage:old?.stage||0,dueAt:Date.now(),reason};
  data.setReviews([item,...list.filter(x=>x.key!==key)].slice(0,100));
}
function updateReview(q,correct){
  const list=data.reviews(),r=list.find(x=>x.prompt===q.prompt);if(!r)return;
  if(correct){r.stage=(r.stage||0)+1;const days=[1,3,7,14,30][Math.min(4,r.stage-1)];r.dueAt=Date.now()+days*86400000;}else{r.stage=0;r.dueAt=Date.now()+86400000;}
  data.setReviews(list);
}

function renderTrophies(){
  evalTrophies();const s=stats(), t=load(KEYS.trophies,{unlocked:{}}),score=trophyScore(),ws=weekStats();
  const locked=TROPHIES.filter(x=>!t.unlocked[x.id]).sort((a,b)=>(s[b.metric]/b.target)-(s[a.metric]/a.target)),next=locked[0],pct=next?Math.min(100,Math.round((s[next.metric]||0)/next.target*100)):100;
  root.innerHTML=shell('<section class="trophyhead"><button class="iconbtn" data-action="back">'+icon('back',17)+'</button><div><span>Pokale</span><h1>'+score+' Punkte</h1></div><strong>'+Object.keys(t.unlocked).length+' / '+TROPHIES.length+'</strong></section>'+
    '<section class="league"><span class="bigcup">'+icon('trophy',25)+'</span><div><small>Stufe</small><strong>'+league(score)+'</strong></div></section>'+
    (next?'<section class="section"><div class="sectionhead"><h2>Nächster Pokal</h2><span>'+pct+'%</span></div>'+trophyCard(next,t,s)+'</section>':'')+
    '<section class="section"><div class="sectionhead"><h2>Diese Woche</h2><span>'+ws.sessions+' Runden</span></div><div class="goals"><div><strong>5 Runden</strong><span><i style="width:'+Math.min(100,ws.sessions/5*100)+'%"></i></span><small>'+Math.min(5,ws.sessions)+' / 5</small></div><div><strong>2 Wiederholungen</strong><span><i style="width:'+Math.min(100,ws.reviews/2*100)+'%"></i></span><small>'+Math.min(2,ws.reviews)+' / 2</small></div></div></section>'+
    '<section class="section"><div class="sectionhead"><h2>Sammlung</h2><span>'+Object.keys(t.unlocked).length+' freigeschaltet</span></div><div class="trophylist">'+TROPHIES.map(x=>trophyCard(x,t,s)).join('')+'</div></section>',
    'home',{noNav:true,noTop:true});
}
function trophyCard(x,t,s){
  const on=!!t.unlocked[x.id],cur=Math.min(x.target,s[x.metric]||0),pct=Math.round(cur/x.target*100);
  return '<article class="trophycard '+(on?'on':'')+'"><span>'+icon('trophy',19)+'</span><div><strong>'+esc(x.name)+'</strong><small>'+esc(x.desc)+'</small>'+(on?'<em>+'+x.points+' Punkte</em>':'<div class="miniprogress"><i style="width:'+pct+'%"></i><b>'+cur+' / '+x.target+'</b></div>')+'</div></article>';
}

function renderCreate(mode){
  state.createMode=mode||state.createMode;root.innerHTML=shell('<section class="pagehead"><h1>Neue Lernrunde</h1></section><div class="tabs create-tabs"><button data-action="create-photo" class="'+(state.createMode==='photo'?'active':'')+'">Foto</button><button data-action="create-text" class="'+(state.createMode==='text'?'active':'')+'">Text</button></div>'+
    '<section class="createbox">'+(state.createMode==='photo'?'<label class="uploadbox">'+(state.createPreview?'<img src="'+state.createPreview+'" alt="">':'<span>'+icon('camera',23)+'</span><strong>Foto auswählen</strong><small>Kamera oder Galerie</small>')+'<input id="photoInput" type="file" accept="image/*" capture="environment"></label>':'')+
    '<label class="field"><span>'+(state.createMode==='text'?'Text':'Notiz (optional)')+'</span><textarea id="createText" placeholder="'+(state.createMode==='text'?'Text einfügen':'Optional')+'">'+esc(state.createText)+'</textarea></label><button class="primary full" data-action="analyze">Fragen erstellen</button></section>',
    'home',{back:true,noNav:true});
  const pi=$('#photoInput');if(pi)pi.onchange=e=>{const f=e.target.files?.[0];if(!f)return;state.createFile=f;if(state.createPreview)URL.revokeObjectURL(state.createPreview);state.createPreview=URL.createObjectURL(f);renderCreate('photo');};
}
function localChallenge(text,title='Aus Notizen'){
  const chunks=String(text||'').split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(x=>x.length>10).slice(0,5);
  const qs=chunks.map((s,i)=>({prompt:'Welche Aussage gehört zum Lernstoff?',choices:[s,'Diese Aussage steht nicht im Lernstoff','Keine der Aussagen'],accepted:[s],explanation:s}));
  while(qs.length<3)qs.push({prompt:'Was ist ein zentraler Begriff aus dem Material?',choices:null,accepted:[String(text).split(/\s+/)[0]||'Lernstoff'],explanation:String(text).slice(0,160)});
  return {id:uid('round'),title,topic:'Lernstoff',questions:qs.slice(0,5)};
}
function challengeFromAnalysis(a){
  const q=[];
  if(a?.strategySelection?.question){q.push({prompt:a.strategySelection.question,choices:a.strategySelection.options||[],accepted:[a.strategySelection.correctOption],explanation:a.strategySelection.explanation||''});}
  (a?.reasoningSteps||[]).forEach(x=>q.push({prompt:x.question,choices:x.options||null,accepted:[x.answer].filter(Boolean),explanation:x.explanation||''}));
  if(a?.correctResult?.display)q.push({prompt:'Was ist das Ergebnis?',choices:null,accepted:a.correctResult.acceptedAnswers||[a.correctResult.display],explanation:a.correctResult.explanation||''});
  return {id:uid('round'),title:a?.title||'Lernrunde',topic:a?.topic||'Lernen',questions:q.filter(x=>x.prompt).slice(0,5)};
}
async function analyze(){
  const text=$('#createText')?.value.trim()||'';state.createText=text;state.createError='';
  if(state.createMode==='text'&&text.length<20){state.createError='Füge etwas mehr Text ein, damit sinnvolle Fragen entstehen können.';renderCreate(state.createMode);return;}
  root.innerHTML='<main class="v14-processing" role="status" aria-live="polite"><span>'+icon(state.createMode==='photo'?'camera':'text',24)+'</span><h1>Fragen werden erstellt</h1><p>'+(state.createMode==='photo'?'Dokument wird gelesen und strukturiert.':'Text wird analysiert und in Lernfragen umgewandelt.')+'</p><div><i></i></div><small>Das dauert normalerweise nur einen Moment.</small></main>';
  try{
    let res;
    if(state.createFile){const fd=new FormData();fd.append('file',state.createFile);if(text)fd.append('text',text);res=await fetch('/api/analyze',{method:'POST',body:fd});}
    else res=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text})});
    if(!res.ok)throw new Error('HTTP '+res.status);const a=await res.json();state.challenge=challengeFromAnalysis(a);if(!state.challenge.questions.length)state.challenge=localChallenge(text);startChallenge(state.challenge,'normal');
  }catch{
    if(text.length>=20)startChallenge(localChallenge(text),'normal');
    else{
      state.createError='Das Dokument konnte gerade nicht verarbeitet werden. Prüfe die Verbindung und versuche es erneut.';
      renderCreate(state.createMode);
    }
  }
}
function startChallenge(ch,mode='normal'){
  state.challenge=ch;state.quizMode=mode;state.q=0;state.score=0;state.answered=false;renderQuestion();
}
function renderQuestion(){
  const ch=state.challenge,q=ch.questions[state.q],total=ch.questions.length,pct=(state.q/total)*100;
  let input=q.choices?.length?'<div class="answers">'+q.choices.map((x,i)=>'<button data-action="answer" data-value="'+esc(x)+'"><span>'+String.fromCharCode(65+i)+'</span><b>'+esc(x)+'</b></button>').join('')+'</div>':'<div class="freeanswer"><input id="answerInput" placeholder="Antwort"><button class="primary" data-action="submit-answer">Prüfen</button></div>';
  let feedback=state.answered?'<div class="feedback '+(state.lastCorrect?'good':'bad')+'">'+icon(state.lastCorrect?'check':'alert',17)+'<div><strong>'+(state.lastCorrect?'Richtig':'Falsch')+'</strong><p>'+esc(state.lastExplanation||'')+'</p></div></div><button class="primary full" data-action="next-question">'+(state.q===total-1?'Ergebnis':'Weiter')+'</button>':'';
  root.innerHTML=shell('<div class="quiztop"><button class="iconbtn" data-action="home">'+icon('close',16)+'</button><div><i style="width:'+pct+'%"></i></div><span>'+(state.q+1)+' / '+total+'</span></div><section class="question"><small>'+esc(ch.topic||'Lernrunde')+'</small><h1>'+esc(q.prompt)+'</h1></section>'+(state.answered?'':input)+feedback,'home',{noTop:true,noNav:true});
}
function checkAnswer(value){
  const q=state.challenge.questions[state.q],norm=x=>String(x||'').toLowerCase().trim().replace(/\s+/g,' ').replace(',', '.');
  const ok=(q.accepted||[]).some(a=>norm(value)===norm(a)) || (q.choices?.length&&norm(value)===norm(q.accepted?.[0]));
  state.lastCorrect=ok;state.lastExplanation=q.explanation||'';state.answered=true;if(ok)state.score++;else if(state.quizMode!=='review')addReview(q,state.challenge,'wrong');if(state.quizMode==='review')updateReview(q,ok);renderQuestion();
}
function finishChallenge(){
  const total=state.challenge.questions.length,pct=Math.round(state.score/total*100),p=data.profile(),today=dayKey(),y=dayKey(new Date(Date.now()-86400000));
  if(p.last!==today){p.streak=p.last===y?(p.streak||0)+1:1;p.last=today;}p.xp=(p.xp||0)+Math.max(10,pct);p.sessions=(p.sessions||0)+1;p.perfects=(p.perfects||0)+(pct===100?1:0);if(state.quizMode==='review')p.reviewsDone=(p.reviewsDone||0)+1;data.setProfile(p);
  recordActivity(state.quizMode==='review'?'reviews':'sessions');
  if(state.quizMode!=='review'){const r=Object.assign({},state.challenge,{id:state.challenge.id||uid('round'),lastPlayedAt:Date.now()});data.setRounds([r,...data.rounds().filter(x=>x.id!==r.id)].slice(0,50));}
  const fresh=evalTrophies();
  root.innerHTML=shell('<section class="result"><span>Ergebnis</span><strong>'+state.score+' / '+total+'</strong><small>'+pct+'%</small></section><div class="resultmeta">'+icon('trophy',15)+'<span>'+league(trophyScore())+'</span><strong>'+trophyScore()+' Pokalpunkte</strong></div>'+(fresh.length?'<button class="unlockrow" data-action="trophies">'+icon('trophy',18)+'<span><strong>'+esc(fresh[0].name)+'</strong><small>Neuer Pokal · +'+fresh[0].points+'</small></span>'+icon('arrow',14)+'</button>':'')+'<button class="primary full" data-action="home">Fertig</button>','home',{noTop:true,noNav:true});
}
function startDue(){
  const due=data.reviews().filter(r=>(r.dueAt||0)<=Date.now()).slice(0,5);if(!due.length){toast('Nichts fällig');return;}
  const ch={id:uid('review'),title:'Wiederholen',topic:'Wiederholen',questions:due.map(r=>({prompt:r.prompt,choices:r.choices,accepted:r.accepted,explanation:r.explanation}))};startChallenge(ch,'review');
}
function startNoteStudy(){
  const n=getNote(),ch=splitChallenge(n);if(!ch){toast('Das Dokument braucht etwas mehr Text');return;}startChallenge(ch,'normal');
}



/* =========================
   SNAPSTUDY V13 UI OVERRIDES
   ========================= */

function v13Date(){
  return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
}
function v13DocumentMeta(n){
  const pages=(n.pages||[]).length,subject=n.subject&&n.subject!=='Ohne Fach'?n.subject:'Dokument';
  return subject+' · '+pages+' '+(pages===1?'Seite':'Seiten')+' · '+fmtDate(n.updatedAt||Date.now());
}
function v13DocRow(n){
  return '<article class="v13-docrow">'+
    '<button data-action="open-note" data-id="'+esc(n.id)+'">'+
      '<span class="v13-docthumb">'+icon('note',20)+'</span>'+
      '<span class="v13-doccopy"><strong>'+esc(n.title||'Unbenannt')+'</strong><small>'+esc(v13DocumentMeta(n))+'</small></span>'+
      (n.pinned?'<span class="v13-pin">'+icon('pin',15)+'</span>':'')+
      '<span class="v13-chevron">'+icon('arrow',15)+'</span>'+
    '</button>'+
  '</article>';
}
function v13Empty(title,copy,action,label){
  return '<div class="v13-empty">'+
    '<span class="v13-emptyicon">'+icon('note',22)+'</span>'+
    '<strong>'+esc(title)+'</strong>'+
    '<p>'+esc(copy)+'</p>'+
    (action?'<button class="v13-secondary" data-action="'+action+'">'+esc(label||'Neu')+'</button>':'')+
  '</div>';
}
function v13Header(title,subtitle,actions=''){
  return '<header class="v13-header"><div><h1>'+esc(title)+'</h1>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</div><div class="v13-header-actions">'+actions+'</div></header>';
}
function nav(active){
  const items=[['home','Heute','home'],['notes','Notizen','note'],['reviews','Wiederholen','repeat'],['library','Sammlung','stack']];
  return '<nav class="v13-tabbar">'+items.map(x=>
    '<button data-action="'+x[0]+'" class="'+(active===x[0]?'active':'')+'">'+
      '<span>'+icon(x[2],22)+'</span><small>'+x[1]+'</small>'+
    '</button>'
  ).join('')+'</nav>';
}
function shell(content,active='home',opts={}){
  return '<main class="v13-app '+(opts.wide?'wide':'')+'"><div class="v13-content">'+content+'</div>'+(opts.noNav?'':nav(active))+'</main>';
}

function renderHome(){
  const notes=data.notes().slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const pinned=notes.filter(n=>n.pinned).slice(0,3);
  const recent=notes.filter(n=>!pinned.some(p=>p.id===n.id)).slice(0,4);
  const due=data.reviews().filter(r=>(r.dueAt||0)<=Date.now());
  const rounds=data.rounds().slice().sort((a,b)=>(b.lastPlayedAt||0)-(a.lastPlayedAt||0));
  const continueRound=rounds[0];

  const plus='<button class="v13-roundicon" data-action="open-create-sheet" aria-label="Neu">'+icon('plus',22)+'</button>';
  let html=v13Header('Heute',v13Date(),plus);

  if(due.length){
    html+='<section class="v13-focus">'+
      '<div><span>Wiederholen</span><strong>'+due.length+' '+(due.length===1?'Karte':'Karten')+' fällig</strong><small>Jetzt kurz festigen</small></div>'+
      '<button data-action="start-due">'+icon('play',16)+'<span>Jetzt lernen</span></button>'+
    '</section>';
  }

  if(continueRound){
    html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Weiterlernen</h2></div>'+
      '<button class="v13-continue" data-action="play-round" data-id="'+esc(continueRound.id)+'">'+
        '<span class="v13-progressring"><i></i></span>'+
        '<span><strong>'+esc(continueRound.title||'Lernrunde')+'</strong><small>'+((continueRound.questions||[]).length||0)+' Fragen</small></span>'+
        icon('arrow',17)+
      '</button></section>';
  }

  if(pinned.length){
    html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Angepinnt</h2><button data-action="library-pinned">Alle</button></div><div class="v13-list">'+pinned.map(v13DocRow).join('')+'</div></section>';
  }

  html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Zuletzt</h2><button data-action="library">Alle</button></div>'+
    (recent.length?'<div class="v13-list">'+recent.map(v13DocRow).join('')+'</div>':v13Empty('Noch keine Dokumente','Erstelle eine Notiz oder importiere Lernmaterial.','open-create-sheet','Neu erstellen'))+
  '</section>';

  if(state.quickCreateOpen){
    html+='<div class="v13-sheetbackdrop" data-action="close-create-sheet"></div>'+
      '<section class="v13-sheet">'+
        '<div class="v13-sheethandle"></div><div class="v13-sheettitle"><h2>Neu</h2><button data-action="close-create-sheet">'+icon('close',20)+'</button></div>'+
        '<button data-action="new-note"><span>'+icon('note',21)+'</span><div><strong>Neue Notiz</strong><small>Leeres Dokument</small></div>'+icon('arrow',16)+'</button>'+
        '<button data-action="create-photo"><span>'+icon('camera',21)+'</span><div><strong>Dokument scannen</strong><small>Kamera oder Galerie</small></div>'+icon('arrow',16)+'</button>'+
        '<button data-action="create-text"><span>'+icon('text',21)+'</span><div><strong>Text einfügen</strong><small>Aus Text Lernfragen erstellen</small></div>'+icon('arrow',16)+'</button>'+
      '</section>';
  }

  root.innerHTML=shell(html,'home');
}

function renderLibrary(){
  const folders=data.folders();
  let notes=data.notes().slice(),rounds=data.rounds().slice();
  const q=state.libraryQuery.trim().toLowerCase();

  if(state.libraryFolder!=='all')notes=notes.filter(n=>n.folderId===state.libraryFolder);
  if(state.libraryTab==='pinned')notes=notes.filter(n=>n.pinned);
  if(state.libraryTab==='favorites')notes=notes.filter(n=>n.favorite);
  if(q){
    notes=notes.filter(n=>{
      const body=(n.pages||[]).map(p=>p.text||'').join(' ');
      return (n.title+' '+(n.subject||'')+' '+body+' '+(n.tags||[]).join(' ')).toLowerCase().includes(q);
    });
    rounds=rounds.filter(r=>(String(r.title||'')+' '+String(r.topic||'')).toLowerCase().includes(q));
  }
  notes.sort((a,b)=>state.librarySort==='title'?String(a.title).localeCompare(String(b.title),'de'):(b.updatedAt||0)-(a.updatedAt||0));

  const plus='<button class="v13-roundicon" data-action="library-new">'+icon('plus',22)+'</button>';
  let html=v13Header(state.libraryFolder==='all'?'Sammlung':folderName(state.libraryFolder),'',plus)+
    '<label class="v13-search">'+icon('search',19)+'<input id="librarySearch" placeholder="Suchen" value="'+esc(state.libraryQuery)+'"></label>'+
    '<div class="v13-segmented">'+
      '<button data-action="library-tab" data-tab="notes" class="'+(state.libraryTab==='notes'?'active':'')+'">Alle</button>'+
      '<button data-action="library-tab" data-tab="pinned" class="'+(state.libraryTab==='pinned'?'active':'')+'">Angepinnt</button>'+
      '<button data-action="library-tab" data-tab="rounds" class="'+(state.libraryTab==='rounds'?'active':'')+'">Lernrunden</button>'+
    '</div>';

  if(state.libraryTab==='notes'&&state.libraryFolder==='all'&&!q&&folders.length){
    html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Ordner</h2><button data-action="new-folder">Neu</button></div><div class="v13-folderlist">'+
      folders.map(f=>'<button data-action="open-folder" data-id="'+esc(f.id)+'"><span>'+icon('folder',22)+'</span><div><strong>'+esc(f.name)+'</strong><small>'+data.notes().filter(n=>n.folderId===f.id).length+' Dokumente</small></div>'+icon('arrow',16)+'</button>').join('')+
    '</div></section>';
  }

  if(state.libraryFolder!=='all'){
    html+='<div class="v13-folderbar"><button data-action="all-folders">'+icon('back',17)+' Alle Ordner</button><button data-action="folder-more">'+icon('more',20)+'</button></div>';
  }

  html+='<section class="v13-section"><div class="v13-sectionhead"><h2>'+(state.libraryTab==='rounds'?'Lernrunden':'Dokumente')+'</h2>'+
    (state.libraryTab!=='rounds'?'<select id="sortSelect"><option value="recent">Zuletzt geändert</option><option value="title">Titel</option></select>':'')+
    '</div>';

  if(state.libraryTab==='rounds'){
    html+=rounds.length?'<div class="v13-list">'+rounds.map(r=>'<article class="v13-docrow"><button data-action="play-round" data-id="'+esc(r.id)+'"><span class="v13-docthumb blue">'+icon('stack',20)+'</span><span class="v13-doccopy"><strong>'+esc(r.title||'Lernrunde')+'</strong><small>'+esc(r.topic||'')+' · '+((r.questions||[]).length)+' Fragen</small></span><span class="v13-chevron">'+icon('arrow',15)+'</span></button></article>').join('')+'</div>':v13Empty('Noch keine Lernrunden','Erstelle Lernfragen aus einem Dokument oder Text.');
  } else {
    html+=notes.length?'<div class="v13-list">'+notes.map(v13DocRow).join('')+'</div>':v13Empty('Keine Dokumente','In diesem Bereich ist noch nichts gespeichert.','open-create-sheet','Dokument erstellen');
  }
  html+='</section>';

  if(state.newMenu){
    html+='<div class="v13-popmenu"><button data-action="new-note">'+icon('note',18)+' Neue Notiz</button><button data-action="new-folder">'+icon('folder',18)+' Neuer Ordner</button></div>';
  }
  if(state.folderMenu){
    html+='<div class="v13-popmenu folder"><button data-action="rename-folder">'+icon('text',17)+' Umbenennen</button><button class="danger" data-action="delete-folder">'+icon('trash',17)+' Ordner löschen</button></div>';
  }
  if(state.folderModal){
    html+='<div class="v13-sheetbackdrop"></div><section class="v13-dialog"><div class="v13-sheettitle"><h2>'+(state.folderModalMode==='rename'?'Ordner umbenennen':'Neuer Ordner')+'</h2><button data-action="close-folder-modal">'+icon('close',19)+'</button></div><input id="folderNameInput" value="'+esc(state.folderModalMode==='rename'?folderName(state.folderEditId):'')+'" placeholder="Name"><button class="v13-primary full" data-action="'+(state.folderModalMode==='rename'?'save-folder-name':'create-folder')+'">'+(state.folderModalMode==='rename'?'Speichern':'Erstellen')+'</button></section>';
  }

  root.innerHTML=shell(html,'library');
  const search=$('#librarySearch');if(search)search.oninput=e=>{state.libraryQuery=e.target.value;renderLibrary();};
  const sort=$('#sortSelect');if(sort){sort.value=state.librarySort;sort.onchange=e=>{state.librarySort=e.target.value;renderLibrary();};}
  if(state.folderModal)requestAnimationFrame(()=>$('#folderNameInput')?.focus());
}

function renderReviews(){
  const all=data.reviews().slice().sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));
  const due=all.filter(r=>(r.dueAt||0)<=Date.now()),later=all.filter(r=>(r.dueAt||0)>Date.now());
  const group=list=>{
    const m={};list.forEach(r=>{const k=r.sourceTitle||'Lernstoff';(m[k]||(m[k]=[])).push(r);});
    return Object.entries(m);
  };

  let html=v13Header('Wiederholen','');
  html+='<section class="v13-reviewhero"><div><span>Heute</span><strong>'+due.length+' '+(due.length===1?'Karte':'Karten')+' fällig</strong></div>'+
    (due.length?'<button class="v13-primary" data-action="start-due">'+icon('play',17)+' Wiederholung starten</button>':'')+
  '</section>';

  if(due.length){
    html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Fällig</h2></div><div class="v13-topiclist">'+
      group(due).map(([name,items])=>'<div><span class="v13-dot"></span><div><strong>'+esc(name)+'</strong><small>'+items.length+' '+(items.length===1?'Karte':'Karten')+'</small></div></div>').join('')+
    '</div></section>';
  } else {
    html+=v13Empty('Alles erledigt','Für heute ist keine Wiederholung mehr fällig.');
  }

  if(later.length){
    html+='<section class="v13-section"><div class="v13-sectionhead"><h2>Demnächst</h2></div><div class="v13-topiclist muted">'+
      group(later.slice(0,8)).map(([name,items])=>'<div><span class="v13-dot"></span><div><strong>'+esc(name)+'</strong><small>'+fmtDate(Math.min(...items.map(x=>x.dueAt)))+' · '+items.length+' '+(items.length===1?'Karte':'Karten')+'</small></div></div>').join('')+
    '</div></section>';
  }
  root.innerHTML=shell(html,'reviews');
}

function renderCreate(mode){
  state.createMode=mode||state.createMode;
  let html='<header class="v13-navtitle"><button data-action="back">'+icon('back',21)+'</button><h1>Neue Lernrunde</h1><span></span></header>'+
    '<div class="v13-segmented create"><button data-action="create-photo" class="'+(state.createMode==='photo'?'active':'')+'">Foto</button><button data-action="create-text" class="'+(state.createMode==='text'?'active':'')+'">Text</button></div>'+
    '<section class="v13-create">';
  if(state.createMode==='photo'){
    html+='<label class="v13-upload">'+(state.createPreview?'<img src="'+state.createPreview+'" alt="">':'<span>'+icon('camera',24)+'</span><strong>Dokument auswählen</strong><small>Kamera oder Galerie</small>')+'<input id="photoInput" type="file" accept="image/*" capture="environment"></label>';
  }
  html+='<label class="v13-field"><span>'+(state.createMode==='text'?'Text':'Notiz (optional)')+'</span><textarea id="createText" placeholder="'+(state.createMode==='text'?'Text hier einfügen':'Optionaler Kontext')+'">'+esc(state.createText)+'</textarea></label>'+
    '<button class="v13-primary full" data-action="analyze">Fragen erstellen</button></section>';
  root.innerHTML=shell(html,'home',{noNav:true});
  const pi=$('#photoInput');if(pi)pi.onchange=e=>{const file=e.target.files?.[0];if(!file)return;state.createFile=file;if(state.createPreview)URL.revokeObjectURL(state.createPreview);state.createPreview=URL.createObjectURL(file);renderCreate('photo');};
}

function renderQuestion(){
  const ch=state.challenge,q=ch.questions[state.q],total=ch.questions.length,pct=((state.q+1)/total)*100;
  let html='<main class="v13-study">'+
    '<header><button data-action="home">'+icon('close',20)+'</button><div><span style="width:'+pct+'%"></span></div><small>'+(state.q+1)+' / '+total+'</small></header>'+
    '<section class="v13-studybody"><span class="v13-studytopic">'+esc(ch.topic||'Lernrunde')+'</span><h1>'+esc(q.prompt)+'</h1>';

  if(!state.answered){
    if(q.choices?.length){
      html+='<div class="v13-answers">'+q.choices.map((x,i)=>'<button data-action="answer" data-value="'+esc(x)+'"><span>'+String.fromCharCode(65+i)+'</span><strong>'+esc(x)+'</strong></button>').join('')+'</div>';
    }else{
      html+='<div class="v13-freeanswer"><input id="answerInput" placeholder="Deine Antwort"><button class="v13-primary" data-action="submit-answer">Prüfen</button></div>';
    }
  }else{
    html+='<div class="v13-feedback '+(state.lastCorrect?'good':'bad')+'"><strong>'+(state.lastCorrect?'Richtig':'Noch nicht')+'</strong>'+(state.lastExplanation?'<p>'+esc(state.lastExplanation)+'</p>':'')+'</div>';
    if(state.quizMode==='review'){
      html+='<div class="v13-rating"><span>Wie sicher warst du?</span><div><button data-action="review-rate" data-rate="again">Nochmal</button><button data-action="review-rate" data-rate="hard">Schwierig</button><button data-action="review-rate" data-rate="good">Gut</button><button data-action="review-rate" data-rate="easy">Einfach</button></div></div>';
    }else{
      html+='<button class="v13-primary full" data-action="next-question">'+(state.q===total-1?'Ergebnis':'Weiter')+'</button>';
    }
  }
  html+='</section></main>';
  root.innerHTML=html;
}

function finishChallenge(){
  const total=state.challenge.questions.length,pct=Math.round(state.score/total*100),p=data.profile(),today=dayKey(),y=dayKey(new Date(Date.now()-86400000));
  if(p.last!==today){p.streak=p.last===y?(p.streak||0)+1:1;p.last=today;}
  p.xp=(p.xp||0)+Math.max(10,pct);p.sessions=(p.sessions||0)+1;p.perfects=(p.perfects||0)+(pct===100?1:0);if(state.quizMode==='review')p.reviewsDone=(p.reviewsDone||0)+1;data.setProfile(p);
  recordActivity(state.quizMode==='review'?'reviews':'sessions');
  if(state.quizMode!=='review'){const r=Object.assign({},state.challenge,{id:state.challenge.id||uid('round'),lastPlayedAt:Date.now()});data.setRounds([r,...data.rounds().filter(x=>x.id!==r.id)].slice(0,50));}
  evalTrophies();
  root.innerHTML='<main class="v13-result"><span>'+icon('check',26)+'</span><h1>Fertig</h1><p>'+state.score+' von '+total+' richtig</p><strong>'+pct+'%</strong><button class="v13-primary" data-action="home">Zur Übersicht</button></main>';
}

function renderNotes(){
  const n=getNote();if(!n){state.screen='library';renderLibrary();return;}
  const p=getPage(n);if(!p){addPage();return;}
  const pages=n.pages||[],pageIndex=pages.findIndex(x=>x.id===p.id),palette=state.recentColors.slice(0,4);
  const searchTerm=state.docSearchQuery.trim().toLowerCase();
  const searchResults=searchTerm?pages.flatMap((pg,i)=>{
    const hay=String(pg.text||'').toLowerCase(),out=[];let at=hay.indexOf(searchTerm),guard=0;
    while(at>=0&&guard<12){out.push({pageId:pg.id,page:i+1,start:at,snippet:String(pg.text||'').slice(Math.max(0,at-30),at+searchTerm.length+60).replace(/\n+/g,' ')});at=hay.indexOf(searchTerm,at+Math.max(1,searchTerm.length));guard++;}
    return out;
  }):[];

  let html='<section class="v13-editor">'+
    '<header class="v13-editorhead"><button data-action="library">'+icon('back',22)+'</button><div><input id="noteTitle" value="'+esc(n.title)+'"><small id="saveStatus">Gespeichert</small></div><button data-action="toggle-doc-search">'+icon('search',21)+'</button><button data-action="note-more">'+icon('more',21)+'</button></header>';

  if(state.docSearchOpen){
    html+='<section class="v13-docsearch"><label>'+icon('search',18)+'<input id="docSearchInput" value="'+esc(state.docSearchQuery)+'" placeholder="Im Dokument suchen"></label>'+
      (searchTerm?'<div>'+ (searchResults.length?searchResults.slice(0,8).map(r=>'<button data-action="doc-search-result" data-page="'+esc(r.pageId)+'" data-start="'+r.start+'"><strong>Seite '+r.page+'</strong><span>'+esc(r.snippet)+'</span></button>').join(''):'<small>Keine Treffer</small>')+'</div>':'')+
    '</section>';
  }

  if(state.noteMode==='edit'&&!state.focus){
    html+='<nav class="v13-toolstrip">'+
      [['pen','pen'],['marker','marker'],['eraser','eraser'],['select','select'],['text','text']].map(x=>'<button data-action="note-tool" data-tool="'+x[0]+'" class="'+(state.noteTool===x[0]?'active':'')+'">'+icon(x[1],21)+'</button>').join('')+
      '<button data-action="toggle-tool-menu" class="'+(state.toolMenu?'active':'')+'">'+icon('plus',21)+'</button>'+
      '<span></span><button data-action="undo">'+icon('undo',20)+'</button><button data-action="redo">'+icon('redo',20)+'</button>'+
    '</nav>';
    html+='<div class="v13-tooloptions">'+toolOptions()+'</div>';
    if(state.toolMenu){
      html+='<div class="v13-insertmenu"><button data-action="note-tool" data-tool="shape">'+icon('shape',18)+' Form</button><label>'+icon('image',18)+' Bild<input id="imageInput" type="file" accept="image/*"></label></div>';
    }
  }

  html+='<div class="v13-paperstage"><div class="paper '+esc(p.paper||'ruled')+'">'+
    '<textarea id="noteText" '+(state.noteMode==='view'?'readonly':'')+' class="'+(state.noteMode==='edit'&&state.noteTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(p.text||'')+'</textarea>'+
    '<canvas id="noteCanvas" width="1000" height="1400"></canvas>'+
    '<div id="imageLayer">'+(p.images||[]).map(img=>'<img data-image-id="'+esc(img.id)+'" class="'+(state.selectedImage===img.id?'selected':'')+'" src="'+img.src+'" style="left:'+img.x+'%;top:'+img.y+'%;width:'+img.w+'%;">').join('')+'</div>'+
  '</div></div>';

  html+='<footer class="v13-editorbar"><button data-action="toggle-pages">'+icon('note',18)+'<span>Seiten</span></button><button data-action="template-menu">'+icon('grid',18)+'<span>Vorlage</span></button><span></span><button class="learn" data-action="note-study">'+icon('play',17)+'<span>Lernen</span></button></footer>';

  if(state.pagesSheetOpen){
    html+='<div class="v13-sheetbackdrop" data-action="toggle-pages"></div><section class="v13-pagesheet"><div class="v13-sheethandle"></div><div class="v13-sheettitle"><h2>Seiten</h2><button data-action="add-page">'+icon('plus',20)+'</button></div><div class="v13-pagegrid">'+
      pages.map((pg,i)=>'<button data-action="open-page" data-id="'+esc(pg.id)+'" class="'+(pg.id===p.id?'active':'')+'"><span class="mini-sheet '+esc(pg.paper||'ruled')+'"></span><small>Seite '+(i+1)+'</small></button>').join('')+
    '</div></section>';
  }

  html+='<div id="noteMenu" class="v13-popmenu note hidden"><button data-action="note-mode" data-mode="'+(state.noteMode==='edit'?'view':'edit')+'">'+icon('note',17)+' '+(state.noteMode==='edit'?'Ansicht':'Bearbeiten')+'</button><button data-action="note-info">'+icon('text',17)+' Details</button><button data-action="mark-note-review">'+icon('repeat',17)+' Wiederholen</button><button data-action="export-note">'+icon('download',17)+' Exportieren</button><button data-action="duplicate-note">'+icon('copy',17)+' Duplizieren</button><button class="danger" data-action="delete-note">'+icon('trash',17)+' Löschen</button></div>';

  html+='<div id="templateMenu" class="v13-sheet hidden"><div class="v13-sheethandle"></div><div class="v13-sheettitle"><h2>Vorlage</h2><button data-action="close-template">'+icon('close',19)+'</button></div><div class="v13-templategrid">'+['plain','ruled','grid','dotted','cornell'].map(kind=>'<button data-action="set-paper" data-paper="'+kind+'"><span class="template '+kind+'"></span><small>'+paperName(kind)+'</small></button>').join('')+'</div></div>';

  if(state.noteInfo){
    html+='<div class="v13-sheetbackdrop"></div><section class="v13-dialog"><div class="v13-sheettitle"><h2>Dokument</h2><button data-action="close-note-info">'+icon('close',19)+'</button></div><label>Titel<input id="infoTitle" value="'+esc(n.title)+'"></label><label>Fach<input id="infoSubject" value="'+esc(n.subject||'')+'"></label><button class="v13-secondary full" data-action="pin-note">'+(n.pinned?'Loslösen':'Anpinnen')+'</button></section>';
  }

  html+='</section>';
  root.innerHTML=html;

  const title=$('#noteTitle');if(title)title.oninput=e=>patchNote({title:e.target.value});
  const infoTitle=$('#infoTitle');if(infoTitle)infoTitle.oninput=e=>patchNote({title:e.target.value});
  const infoSubject=$('#infoSubject');if(infoSubject)infoSubject.oninput=e=>patchNote({subject:e.target.value});
  const ds=$('#docSearchInput');if(ds){ds.oninput=e=>{state.docSearchQuery=e.target.value;renderNotes();};requestAnimationFrame(()=>$('#docSearchInput')?.focus());}
  bindNote(n,p);
}



/* =========================
   SNAPSTUDY V14 — NATIVE MATERIAL UI
   ========================= */
function v14Haptic(ms=8){
  try{if(navigator.vibrate)navigator.vibrate(ms);}catch{}
}
function v14Transition(fn){
  try{
    if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)return document.startViewTransition(fn);
  }catch{}
  return fn();
}
function v14RenderCurrent(){
  if(state.screen==='library')renderLibrary();
  else if(state.screen==='reviews')renderReviews();
  else if(state.screen==='noteslist')renderNotesList();
  else if(state.screen==='notes')renderNotes();
  else renderHome();
}
function v14BindLargeTitle(){
  const scroller=document.querySelector('.v14-scroll'),bar=document.querySelector('.v14-navbar');
  if(!scroller||!bar)return;
  const sync=()=>bar.classList.toggle('collapsed',scroller.scrollTop>44);
  scroller.addEventListener('scroll',sync,{passive:true});sync();
}
function v14TimeEstimate(count){return Math.max(2,Math.round(count*1.1));}
function v14RestoreInput(id,pos){
  requestAnimationFrame(()=>{
    const el=document.getElementById(id);if(!el)return;
    el.focus({preventScroll:true});
    try{const p=Math.min(Number.isFinite(pos)?pos:el.value.length,el.value.length);el.setSelectionRange(p,p);}catch{}
  });
}

function v14DeleteDocument(id){
  const notes=data.notes(),i=notes.findIndex(n=>n.id===id);if(i<0)return false;
  const next=notes.slice(),[n]=next.splice(i,1);n.deletedAt=Date.now();
  data.setNotes(next);data.setDeleted([n,...data.deleted()].slice(0,50));
  if(state.noteId===id){const fallback=next[Math.max(0,i-1)]||next[0];state.noteId=fallback?.id;state.pageId=fallback?.pages?.[0]?.id;}
  return true;
}

function v14BindDocumentGestures(){
  document.querySelectorAll('.v14-docrow[data-doc-id]').forEach(row=>{
    const main=row.querySelector(':scope > button[data-action="open-note"]');
    if(!main)return;
    let startX=0,startY=0,moved=false,longPress=false,timer=null;
    const reset=()=>{clearTimeout(timer);timer=null;};
    main.addEventListener('pointerdown',e=>{
      startX=e.clientX;startY=e.clientY;moved=false;longPress=false;
      timer=setTimeout(()=>{
        if(moved)return;
        longPress=true;main.dataset.blockClick='1';state.docContextId=row.dataset.docId;v14Haptic(16);v14RenderCurrent();
      },520);
    });
    main.addEventListener('pointermove',e=>{
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.abs(dx)>10||Math.abs(dy)>10){moved=true;reset();}
    });
    main.addEventListener('pointerup',e=>{
      reset();if(longPress)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(Math.abs(dx)>58&&Math.abs(dx)>Math.abs(dy)*1.4){
        main.dataset.blockClick='1';
        document.querySelectorAll('.v14-docrow.swipe-left,.v14-docrow.swipe-right').forEach(x=>{if(x!==row)x.classList.remove('swipe-left','swipe-right');});
        row.classList.remove('swipe-left','swipe-right');
        row.classList.add(dx<0?'swipe-left':'swipe-right');
        v14Haptic();
      }
    });
    main.addEventListener('pointercancel',reset);
    main.addEventListener('click',e=>{
      if(main.dataset.blockClick==='1'){e.preventDefault();e.stopImmediatePropagation();main.dataset.blockClick='0';}
    },true);
  });
}
function v14ContextSheet(){
  const n=data.notes().find(x=>x.id===state.docContextId);
  if(!n)return '';
  if(state.moveSheetOpen){
    const folders=data.folders();
    return '<div class="v14-dim" data-action="close-doc-context"></div><section class="v14-actionsheet compact" role="dialog" aria-modal="true">'+
      '<div class="v14-sheetgrabber"></div><header><h2>Verschieben</h2><button data-action="close-doc-context">'+icon('close',19)+'</button></header>'+
      '<button data-action="move-context-note" data-folder="none"><span>'+icon('stack',19)+'</span><div><strong>Kein Ordner</strong></div>'+(!n.folderId?icon('check',17):'')+'</button>'+
      folders.map(f=>'<button data-action="move-context-note" data-folder="'+esc(f.id)+'"><span>'+icon('folder',19)+'</span><div><strong>'+esc(f.name)+'</strong></div>'+(n.folderId===f.id?icon('check',17):'')+'</button>').join('')+
    '</section>';
  }
  return '<div class="v14-dim" data-action="close-doc-context"></div><section class="v14-actionsheet compact" role="dialog" aria-modal="true">'+
    '<div class="v14-sheetgrabber"></div><header><div><h2>'+esc(n.title||'Dokument')+'</h2><small>'+esc(v14DocumentMeta(n))+'</small></div><button data-action="close-doc-context">'+icon('close',19)+'</button></header>'+
    '<button data-action="context-open"><span>'+icon('note',19)+'</span><div><strong>Öffnen</strong></div>'+icon('arrow',14)+'</button>'+
    '<button data-action="context-pin"><span>'+icon('pin',19)+'</span><div><strong>'+(n.pinned?'Loslösen':'Anpinnen')+'</strong></div></button>'+
    '<button data-action="context-move"><span>'+icon('folder',19)+'</span><div><strong>Verschieben</strong></div>'+icon('arrow',14)+'</button>'+
    '<button data-action="context-duplicate"><span>'+icon('copy',19)+'</span><div><strong>Duplizieren</strong></div></button>'+
    '<button data-action="context-export"><span>'+icon('download',19)+'</span><div><strong>Exportieren</strong></div></button>'+
    '<button class="danger" data-action="context-delete"><span>'+icon('trash',19)+'</span><div><strong>Löschen</strong></div></button>'+
  '</section>';
}

function v14Preview(page,large=false){
  page=page||{};
  const image=(page.images||[])[0];
  const text=String(page.text||'').trim();
  const cls='v14-paperthumb '+(large?'large ':'')+esc(page.paper||'ruled');
  if(image?.src)return '<span class="'+cls+' image"><img src="'+esc(image.src)+'" alt=""></span>';
  const excerpt=esc(text.slice(0,110)||' ');
  return '<span class="'+cls+'"><i></i><i></i><i></i><em>'+excerpt+'</em></span>';
}
function v14DocRow(n){
  const page=(n.pages||[])[0]||{};
  const pages=(n.pages||[]).length;
  const subject=n.subject&&n.subject!=='Ohne Fach'?n.subject:'Dokument';
  return '<article class="v14-docrow" data-doc-id="'+esc(n.id)+'">'+
    '<button class="v14-swipeaction pin" data-action="quick-pin" data-id="'+esc(n.id)+'">'+icon('pin',19)+'<small>'+(n.pinned?'Los':'Pin')+'</small></button>'+
    '<button class="v14-swipeaction delete" data-action="quick-delete" data-id="'+esc(n.id)+'">'+icon('trash',19)+'<small>Löschen</small></button>'+
    '<button class="v14-rowmain" data-action="open-note" data-id="'+esc(n.id)+'">'+
      v14Preview(page,false)+
      '<span class="v14-doccopy"><strong>'+esc(n.title||'Unbenannt')+'</strong><small>'+esc(subject)+' · '+pages+' '+(pages===1?'Seite':'Seiten')+' · '+fmtDate(n.updatedAt||Date.now())+'</small></span>'+
      (n.pinned?'<span class="v14-pin">'+icon('pin',15)+'</span>':'')+
      '<span class="v14-rowarrow">'+icon('arrow',14)+'</span>'+
    '</button>'+
  '</article>';
}
function v14Section(title,action='',act=''){
  return '<div class="v14-sectionhead"><h2>'+esc(title)+'</h2>'+(action?'<button data-action="'+act+'">'+esc(action)+'</button>':'')+'</div>';
}
function v14LargeNav(title,subtitle='',action=''){
  return '<header class="v14-navbar"><div class="v14-navleft"><strong>'+esc(title)+'</strong></div><div class="v14-navactions">'+action+'</div></header>'+
    '<section class="v14-largetitle"><h1>'+esc(title)+'</h1>'+(subtitle?'<p>'+esc(subtitle)+'</p>':'')+'</section>';
}
function v14Empty(title,copy,action='',label=''){
  return '<section class="v14-empty"><span>'+icon('note',24)+'</span><h3>'+esc(title)+'</h3><p>'+esc(copy)+'</p>'+(action?'<button class="v14-secondary" data-action="'+action+'">'+esc(label||'Neu')+'</button>':'')+'</section>';
}
function v14CreateSheet(includeFolder=false){
  if(!state.quickCreateOpen)return '';
  return '<div class="v14-dim" data-action="close-create-sheet"></div><section class="v14-actionsheet" role="dialog" aria-modal="true">'+
    '<div class="v14-sheetgrabber"></div><header><h2>Neu</h2><button data-action="close-create-sheet">'+icon('close',19)+'</button></header>'+
    '<button data-action="new-note"><span>'+icon('note',21)+'</span><div><strong>Neue Notiz</strong><small>Leeres Dokument</small></div>'+icon('arrow',14)+'</button>'+
    '<button data-action="create-photo"><span>'+icon('camera',21)+'</span><div><strong>Dokument scannen</strong><small>Kamera oder Foto</small></div>'+icon('arrow',14)+'</button>'+
    '<button data-action="create-text"><span>'+icon('text',21)+'</span><div><strong>Text einfügen</strong><small>Lernfragen aus Text</small></div>'+icon('arrow',14)+'</button>'+
    (includeFolder?'<button data-action="new-folder"><span>'+icon('folder',21)+'</span><div><strong>Neuer Ordner</strong><small>Dokumente organisieren</small></div>'+icon('arrow',14)+'</button>':'')+
  '</section>';
}
function nav(active){
  const items=[['home','Heute','home','homeFill'],['notes','Notizen','note','noteFill'],['reviews','Wiederholen','repeat','repeatFill'],['library','Sammlung','stack','stackFill']];
  return '<nav class="v14-tabbar" aria-label="Hauptnavigation"><div>'+items.map(x=>'<button data-action="'+x[0]+'" class="'+(active===x[0]?'active':'')+'" '+(active===x[0]?'aria-current="page"':'')+'><span>'+icon(active===x[0]?x[3]:x[2],22)+'</span><small>'+x[1]+'</small></button>').join('')+'</div></nav>';
}
function shell(content,active='home',opts={}){
  return '<main class="v14-app '+(opts.wide?'wide':'')+'"><div class="v14-scroll">'+content+'</div>'+(opts.noNav?'':nav(active))+'</main>';
}

function renderHome(){
  state.screen='home';
  const notes=data.notes().slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const pinned=notes.filter(n=>n.pinned).slice(0,3);
  const recent=notes.filter(n=>!pinned.some(p=>p.id===n.id)).slice(0,4);
  const due=data.reviews().filter(r=>(r.dueAt||0)<=Date.now());
  const rounds=data.rounds().slice().sort((a,b)=>(b.lastPlayedAt||0)-(a.lastPlayedAt||0));
  const continueRound=rounds[0];
  const add='<button class="v14-circle secondary" data-action="trophies" aria-label="Pokale">'+icon('trophy',19)+'</button><button class="v14-circle" data-action="open-create-sheet" aria-label="Neu">'+icon('plus',21)+'</button>';
  let html=v14LargeNav('Heute',v13Date(),add);

  if(due.length){
    html+='<section class="v14-focus">'+
      '<div class="v14-focuscopy"><span>Wiederholen</span><strong>'+due.length+' '+(due.length===1?'Karte':'Karten')+' fällig</strong><small>Etwa '+v14TimeEstimate(due.length)+' Minuten</small></div>'+
      '<button data-action="start-due">'+icon('play',16)+'<span>Jetzt wiederholen</span></button>'+
    '</section>';
  }

  if(continueRound){
    html+='<section class="v14-section">'+v14Section('Weiterlernen')+
      '<button class="v14-continue" data-action="play-round" data-id="'+esc(continueRound.id)+'">'+
        '<span class="v14-roundpreview">'+icon('play',18)+'</span>'+
        '<span><strong>'+esc(continueRound.title||'Lernrunde')+'</strong><small>'+esc(continueRound.topic||'Lernen')+' · '+((continueRound.questions||[]).length||0)+' Fragen</small></span>'+
        icon('arrow',15)+
      '</button></section>';
  }

  if(pinned.length){
    html+='<section class="v14-section">'+v14Section('Angepinnt','Alle','library-pinned')+'<div class="v14-list">'+pinned.map(v14DocRow).join('')+'</div></section>';
  }

  html+='<section class="v14-section">'+v14Section('Zuletzt','Alle','library')+
    (recent.length?'<div class="v14-list">'+recent.map(v14DocRow).join('')+'</div>':v14Empty('Noch keine Dokumente','Erstelle eine Notiz oder importiere Lernmaterial.','open-create-sheet','Neu erstellen'))+
  '</section>'+v14CreateSheet(false)+v14ContextSheet();

  root.innerHTML=shell(html,'home');
  requestAnimationFrame(()=>{v14BindLargeTitle();v14BindDocumentGestures();});
}

function renderLibrary(){
  state.screen='library';
  const folders=data.folders();
  const deleted=data.deleted().slice().sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  let notes=data.notes().slice(),rounds=data.rounds().slice();
  const q=state.libraryQuery.trim().toLowerCase();

  if(state.libraryFolder!=='all')notes=notes.filter(n=>n.folderId===state.libraryFolder);
  if(state.libraryTab==='pinned')notes=notes.filter(n=>n.pinned);
  if(state.libraryTab==='favorites')notes=notes.filter(n=>n.favorite);

  if(q){
    notes=notes.filter(n=>{
      const text=(n.pages||[]).map(p=>p.text||'').join(' ');
      return (String(n.title||'')+' '+String(n.subject||'')+' '+text+' '+(n.tags||[]).join(' ')).toLowerCase().includes(q);
    });
    rounds=rounds.filter(r=>(String(r.title||'')+' '+String(r.topic||'')).toLowerCase().includes(q));
  }
  notes.sort((a,b)=>state.librarySort==='title'?String(a.title).localeCompare(String(b.title),'de'):(b.updatedAt||0)-(a.updatedAt||0));

  const secondary=state.libraryTab==='favorites'||state.libraryTab==='deleted';
  const title=state.libraryTab==='favorites'?'Favoriten':state.libraryTab==='deleted'?'Gelöscht':(state.libraryFolder==='all'?'Sammlung':folderName(state.libraryFolder));
  const actions='<button class="v14-circle secondary" data-action="library-options" aria-label="Weitere Optionen">'+icon('more',20)+'</button><button class="v14-circle" data-action="library-new" aria-label="Neu">'+icon('plus',21)+'</button>';
  let html=v14LargeNav(title,'',actions);

  if(secondary){
    html+='<div class="v14-foldercrumb"><button data-action="library-tab" data-tab="notes">'+icon('back',16)+' Sammlung</button></div>';
  }else{
    html+='<label class="v14-search">'+icon('search',18)+'<input id="librarySearch" placeholder="Suchen" value="'+esc(state.libraryQuery)+'"></label>'+
      '<div class="v14-segment"><button data-action="library-tab" data-tab="notes" class="'+(state.libraryTab==='notes'?'active':'')+'">Alle</button><button data-action="library-tab" data-tab="pinned" class="'+(state.libraryTab==='pinned'?'active':'')+'">Angepinnt</button><button data-action="library-tab" data-tab="rounds" class="'+(state.libraryTab==='rounds'?'active':'')+'">Lernrunden</button></div>';
  }

  if(state.libraryFolder!=='all'&&!secondary){
    html+='<div class="v14-foldercrumb"><button data-action="all-folders">'+icon('back',16)+' Alle Ordner</button><button data-action="folder-more" aria-label="Ordneroptionen">'+icon('more',20)+'</button></div>';
  }

  if(state.libraryTab==='notes'&&state.libraryFolder==='all'&&!q&&folders.length){
    html+='<section class="v14-section">'+v14Section('Ordner','Neu','new-folder')+'<div class="v14-foldergrid">'+
      folders.map(f=>'<button data-action="open-folder" data-id="'+esc(f.id)+'"><span class="v14-foldericon">'+icon('folder',22)+'</span><strong>'+esc(f.name)+'</strong><small>'+data.notes().filter(n=>n.folderId===f.id).length+' Dokumente</small></button>').join('')+
    '</div></section>';
  }

  const sectionTitle=state.libraryTab==='rounds'?'Lernrunden':state.libraryTab==='favorites'?'Favoriten':state.libraryTab==='deleted'?'Zuletzt gelöscht':'Dokumente';
  html+='<section class="v14-section">'+v14Section(sectionTitle,(state.libraryTab==='notes'||state.libraryTab==='pinned'||state.libraryTab==='favorites')?'Sortieren':'',(state.libraryTab==='notes'||state.libraryTab==='pinned'||state.libraryTab==='favorites')?'open-sort-sheet':'');

  if(state.libraryTab==='rounds'){
    html+=rounds.length?'<div class="v14-list">'+rounds.map(r=>'<article class="v14-docrow"><button data-action="play-round" data-id="'+esc(r.id)+'"><span class="v14-roundthumb">'+icon('stack',20)+'</span><span class="v14-doccopy"><strong>'+esc(r.title||'Lernrunde')+'</strong><small>'+esc(r.topic||'Lernen')+' · '+((r.questions||[]).length)+' Fragen</small></span><span class="v14-rowarrow">'+icon('arrow',14)+'</span></button></article>').join('')+'</div>':v14Empty('Noch keine Lernrunden','Erstelle Lernfragen aus einem Dokument oder Text.');
  }else if(state.libraryTab==='deleted'){
    html+=deleted.length?'<div class="v14-deletedlist">'+deleted.map(n=>'<article><span class="v14-docthumb deleted">'+icon('trash',19)+'</span><div><strong>'+esc(n.title||'Unbenannt')+'</strong><small>Gelöscht '+fmtDate(n.deletedAt||Date.now())+'</small></div><button data-action="restore-note" data-id="'+esc(n.id)+'">Wiederherstellen</button><button class="icon" data-action="purge-note" data-id="'+esc(n.id)+'" aria-label="Endgültig löschen">'+icon('trash',17)+'</button></article>').join('')+'</div>':v14Empty('Papierkorb ist leer','Gelöschte Dokumente erscheinen hier.');
  }else{
    html+=notes.length?'<div class="v14-list">'+notes.map(v14DocRow).join('')+'</div>':v14Empty(state.libraryTab==='favorites'?'Keine Favoriten':'Keine Dokumente',state.libraryTab==='favorites'?'Markiere wichtige Dokumente als Favorit.':'Hier ist noch nichts gespeichert.',state.libraryTab==='favorites'?'':'library-new',state.libraryTab==='favorites'?'':'Dokument erstellen');
  }
  html+='</section>';

  if(state.sortSheetOpen){
    html+='<div class="v14-dim" data-action="close-sort-sheet"></div><section class="v14-actionsheet compact" role="dialog" aria-modal="true"><div class="v14-sheetgrabber"></div><header><h2>Sortieren</h2><button data-action="close-sort-sheet">'+icon('close',19)+'</button></header><button data-action="set-sort" data-sort="recent"><span>'+icon('repeat',19)+'</span><div><strong>Zuletzt geändert</strong></div>'+(state.librarySort==='recent'?icon('check',17):'')+'</button><button data-action="set-sort" data-sort="title"><span>'+icon('text',19)+'</span><div><strong>Titel</strong></div>'+(state.librarySort==='title'?icon('check',17):'')+'</button></section>';
  }
  if(state.libraryOptionsOpen){
    html+='<div class="v14-dim" data-action="close-library-options"></div><section class="v14-actionsheet compact" role="dialog" aria-modal="true"><div class="v14-sheetgrabber"></div><header><h2>Sammlung</h2><button data-action="close-library-options">'+icon('close',19)+'</button></header>'+
      '<button data-action="library-tab" data-tab="favorites"><span>'+icon('star',19)+'</span><div><strong>Favoriten</strong></div>'+icon('arrow',14)+'</button>'+
      '<button data-action="library-tab" data-tab="deleted"><span>'+icon('trash',19)+'</span><div><strong>Gelöscht</strong></div>'+icon('arrow',14)+'</button>'+
      '<button data-action="backup"><span>'+icon('download',19)+'</span><div><strong>Backup sichern</strong><small>Lokale Daten exportieren</small></div></button>'+
      '<label class="v14-sheetfile"><span>'+icon('upload',19)+'</span><div><strong>Backup importieren</strong><small>JSON-Datei auswählen</small></div><input id="v14BackupInput" type="file" accept="application/json"></label>'+
    '</section>';
  }
  if(state.folderMenu){
    html+='<div class="v14-contextmenu folder"><button data-action="rename-folder">'+icon('text',17)+' Umbenennen</button><button class="danger" data-action="delete-folder">'+icon('trash',17)+' Ordner löschen</button></div>';
  }
  if(state.folderModal){
    html+='<div class="v14-dim"></div><section class="v14-alert"><h2>'+(state.folderModalMode==='rename'?'Ordner umbenennen':'Neuer Ordner')+'</h2><input id="folderNameInput" value="'+esc(state.folderModalMode==='rename'?folderName(state.folderEditId):'')+'" placeholder="Name"><div><button data-action="close-folder-modal">Abbrechen</button><button data-action="'+(state.folderModalMode==='rename'?'save-folder-name':'create-folder')+'">'+(state.folderModalMode==='rename'?'Sichern':'Erstellen')+'</button></div></section>';
  }

  html+=v14CreateSheet(true)+v14ContextSheet();
  root.innerHTML=shell(html,'library');

  const search=$('#librarySearch');
  if(search)search.oninput=e=>{const pos=e.target.selectionStart??e.target.value.length;state.libraryQuery=e.target.value;renderLibrary();v14RestoreInput('librarySearch',pos);};
  const backupInput=$('#v14BackupInput');if(backupInput)backupInput.onchange=e=>restoreBackup(e.target.files?.[0]);
  if(state.folderModal)requestAnimationFrame(()=>$('#folderNameInput')?.focus());
  requestAnimationFrame(()=>{v14BindLargeTitle();v14BindDocumentGestures();});
}

function renderReviews(){
  state.screen='reviews';
  const all=data.reviews().slice().sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));
  const due=all.filter(r=>(r.dueAt||0)<=Date.now()),later=all.filter(r=>(r.dueAt||0)>Date.now());
  const grouped=list=>{const m={};list.forEach(r=>{const k=r.sourceTitle||'Lernstoff';(m[k]||(m[k]=[])).push(r);});return Object.entries(m);};

  let html=v14LargeNav('Wiederholen','')+
    '<section class="v14-reviewfocus"><div><span>Heute</span><strong>'+due.length+' '+(due.length===1?'Karte':'Karten')+'</strong><small>ca. '+v14TimeEstimate(due.length)+' Minuten</small></div>'+
    (due.length?'<button class="v14-primary" data-action="start-due">'+icon('play',16)+' Wiederholung starten</button>':'')+'</section>';

  html+='<section class="v14-section">'+v14Section('Heute fällig')+
    (due.length?'<div class="v14-topiclist">'+grouped(due).map(([name,items])=>'<div><span></span><div><strong>'+esc(name)+'</strong><small>'+items.length+' '+(items.length===1?'Karte':'Karten')+'</small></div></div>').join('')+'</div>':v14Empty('Alles erledigt','Für heute ist keine Wiederholung mehr fällig.'))+
  '</section>';

  if(later.length){
    html+='<section class="v14-section">'+v14Section('Demnächst')+'<div class="v14-topiclist later">'+grouped(later.slice(0,10)).map(([name,items])=>'<div><span></span><div><strong>'+esc(name)+'</strong><small>'+fmtDate(Math.min(...items.map(x=>x.dueAt)))+' · '+items.length+' '+(items.length===1?'Karte':'Karten')+'</small></div></div>').join('')+'</div></section>';
  }

  root.innerHTML=shell(html,'reviews');
  requestAnimationFrame(v14BindLargeTitle);
}

function renderCreate(mode){
  state.screen='create';state.createMode=mode||state.createMode;
  let html='<header class="v14-compactnav"><button data-action="back">'+icon('back',21)+'</button><strong>Neue Lernrunde</strong><span></span></header>'+
    '<main class="v14-create"><div class="v14-segment"><button data-action="create-photo" class="'+(state.createMode==='photo'?'active':'')+'">Foto</button><button data-action="create-text" class="'+(state.createMode==='text'?'active':'')+'">Text</button></div>';
  if(state.createMode==='photo'){
    html+='<label class="v14-upload">'+(state.createPreview?'<img src="'+state.createPreview+'" alt="">':'<span>'+icon('camera',25)+'</span><strong>Dokument auswählen</strong><small>Kamera oder Fotomediathek</small>')+'<input id="photoInput" type="file" accept="image/*"></label>';
  }
  html+='<label class="v14-field"><span>'+(state.createMode==='text'?'Text':'Kontext (optional)')+'</span><textarea id="createText" placeholder="'+(state.createMode==='text'?'Text einfügen':'Optionaler Hinweis')+'">'+esc(state.createText)+'</textarea></label>'+
    (state.createError?'<div class="v14-inlineerror">'+icon('alert',18)+'<span>'+esc(state.createError)+'</span></div>':'')+
    '<button class="v14-primary full" data-action="analyze">Fragen erstellen</button></main>';
  root.innerHTML='<main class="v14-app">'+html+'</main>';
  const pi=$('#photoInput');if(pi)pi.onchange=e=>{const file=e.target.files?.[0];if(!file)return;state.createFile=file;if(state.createPreview)URL.revokeObjectURL(state.createPreview);state.createPreview=URL.createObjectURL(file);renderCreate('photo');};
}

function renderQuestion(){
  const ch=state.challenge,q=ch.questions[state.q],total=ch.questions.length,pct=((state.q+1)/total)*100;
  let html='<main class="v14-study"><header><button data-action="home">'+icon('close',20)+'</button><div><i style="width:'+pct+'%"></i></div><small>'+(state.q+1)+' / '+total+'</small></header><section class="v14-studybody"><span>'+esc(ch.topic||'Lernrunde')+'</span><h1>'+esc(q.prompt)+'</h1>';
  if(!state.answered){
    if(q.choices?.length){
      html+='<div class="v14-answers">'+q.choices.map((x,i)=>'<button data-action="answer" data-value="'+esc(x)+'"><span>'+String.fromCharCode(65+i)+'</span><strong>'+esc(x)+'</strong></button>').join('')+'</div>';
    }else{
      html+='<div class="v14-freeanswer"><input id="answerInput" placeholder="Deine Antwort"><button class="v14-primary" data-action="submit-answer">Prüfen</button></div>';
    }
  }else{
    html+='<div class="v14-feedback '+(state.lastCorrect?'good':'bad')+'"><strong>'+(state.lastCorrect?'Richtig':'Noch nicht')+'</strong>'+(state.lastExplanation?'<p>'+esc(state.lastExplanation)+'</p>':'')+'</div>';
    if(state.quizMode==='review'){
      html+='<div class="v14-rating"><span>Wie sicher warst du?</span><div><button data-action="review-rate" data-rate="again">Nochmal</button><button data-action="review-rate" data-rate="hard">Schwierig</button><button data-action="review-rate" data-rate="good">Gut</button><button data-action="review-rate" data-rate="easy">Einfach</button></div></div>';
    }else html+='<button class="v14-primary full next" data-action="next-question">'+(state.q===total-1?'Ergebnis':'Weiter')+'</button>';
  }
  html+='</section></main>';root.innerHTML=html;
}

function finishChallenge(){
  const total=state.challenge.questions.length,pct=Math.round(state.score/total*100),p=data.profile(),today=dayKey(),y=dayKey(new Date(Date.now()-86400000));
  if(p.last!==today){p.streak=p.last===y?(p.streak||0)+1:1;p.last=today;}
  p.xp=(p.xp||0)+Math.max(10,pct);p.sessions=(p.sessions||0)+1;p.perfects=(p.perfects||0)+(pct===100?1:0);if(state.quizMode==='review')p.reviewsDone=(p.reviewsDone||0)+1;data.setProfile(p);
  recordActivity(state.quizMode==='review'?'reviews':'sessions');
  if(state.quizMode!=='review'){const r=Object.assign({},state.challenge,{id:state.challenge.id||uid('round'),lastPlayedAt:Date.now()});data.setRounds([r,...data.rounds().filter(x=>x.id!==r.id)].slice(0,50));}
  evalTrophies();v14Haptic(18);
  root.innerHTML='<main class="v14-result"><span>'+icon('check',27)+'</span><h1>Fertig</h1><p>'+state.score+' von '+total+' richtig</p><strong>'+pct+'%</strong><button class="v14-primary" data-action="home">Zur Übersicht</button></main>';
}

function v14EditorContext(n,p){
  if(state.selection&&state.selection.noteId===n.id&&state.selection.pageId===p.id&&state.selection.ids.length){
    return '<div class="v14-objectbar"><button data-action="copy-selection">'+icon('copy',17)+'</button><button data-action="recolor-selection"><i style="background:'+state.color+'"></i></button><button class="danger" data-action="delete-selection">'+icon('trash',17)+'</button></div>';
  }
  if(state.selectedImage){
    return '<div class="v14-objectbar"><button data-action="image-smaller">−</button><button data-action="image-larger">+</button><button class="danger" data-action="image-delete">'+icon('trash',17)+'</button></div>';
  }
  return '';
}
function v14ToolOptions(){
  if(state.noteTool==='pen'||state.noteTool==='marker'){
    const isPen=state.noteTool==='pen',size=isPen?state.penSize:state.markerSize,action=isPen?'pen-size':'marker-size',sizes=isPen?[3,5,8]:[18,28,40];
    return '<div class="v14-toolaccessory"><div class="v14-colors">'+state.recentColors.slice(0,5).map(col=>'<button data-action="note-color" data-color="'+col+'" class="'+(state.color===col?'active':'')+'" style="--c:'+col+'"></button>').join('')+'</div><div class="v14-sizes">'+sizes.map(v=>'<button data-action="'+action+'" data-size="'+v+'" class="'+(size===v?'active':'')+'"><i style="--s:'+Math.max(3,Math.min(12,isPen?v:v/4))+'px"></i></button>').join('')+'</div></div>';
  }
  if(state.noteTool==='eraser'){
    return '<div class="v14-toolaccessory"><div class="v14-eraserseg"><button data-action="eraser-mode" data-mode="precision" class="'+(state.eraserMode==='precision'?'active':'')+'">Pixel</button><button data-action="eraser-mode" data-mode="stroke" class="'+(state.eraserMode==='stroke'?'active':'')+'">Objekt</button></div><div class="v14-sizes">'+[30,55,90].map(v=>'<button data-action="eraser-size" data-size="'+v+'" class="'+(state.eraserSize===v?'active':'')+'">'+(v===30?'S':v===55?'M':'L')+'</button>').join('')+'</div></div>';
  }
  return '';
}
function renderNotes(){
  state.screen='notes';
  const n=getNote();if(!n){state.screen='library';renderLibrary();return;}
  const p=getPage(n);if(!p){addPage();return;}
  const pages=n.pages||[],searchTerm=state.docSearchQuery.trim().toLowerCase();
  const results=searchTerm?pages.flatMap((pg,i)=>{const hay=String(pg.text||'').toLowerCase(),out=[];let at=hay.indexOf(searchTerm),guard=0;while(at>=0&&guard<10){out.push({pageId:pg.id,page:i+1,start:at,snippet:String(pg.text||'').slice(Math.max(0,at-28),at+searchTerm.length+55).replace(/\n+/g,' ')});at=hay.indexOf(searchTerm,at+Math.max(1,searchTerm.length));guard++;}return out;}):[];

  let html='<section class="v14-editor '+(state.noteMode==='view'?'view':'edit')+'">'+
    '<header class="v14-editornav"><button data-action="editor-back">'+icon('back',22)+'</button><div><input id="noteTitle" value="'+esc(n.title)+'"><small id="saveStatus">Gespeichert</small></div><button data-action="note-more">'+icon('more',22)+'</button></header>';

  if(state.noteMode==='edit'&&!state.focus){
    html+='<nav class="v14-toolglass" aria-label="Werkzeuge">'+[['pen','pen','Stift'],['marker','marker','Marker'],['eraser','eraser','Radierer'],['select','select','Lasso'],['text','text','Text']].map(x=>'<button aria-label="'+x[2]+'" data-action="note-tool" data-tool="'+x[0]+'" class="'+(state.noteTool===x[0]?'active':'')+'">'+icon(x[1],21)+'</button>').join('')+'<button aria-label="Weitere Werkzeuge" data-action="toggle-tool-menu" class="'+(state.toolMenu?'active':'')+'">'+icon('plus',21)+'</button></nav>'+v14ToolOptions();
  }
  if(state.toolMenu){
    html+='<div class="v14-contextmenu insert"><button data-action="note-tool" data-tool="shape">'+icon('shape',18)+' Form</button><label>'+icon('image',18)+' Bild<input id="imageInput" type="file" accept="image/*"></label></div>';
  }
  if(state.docSearchOpen){
    html+='<section class="v14-docsearch"><label>'+icon('search',18)+'<input id="docSearchInput" value="'+esc(state.docSearchQuery)+'" placeholder="Im Dokument suchen"><button data-action="toggle-doc-search">Abbrechen</button></label>'+(searchTerm?'<div>'+ (results.length?results.map(r=>'<button data-action="doc-search-result" data-page="'+esc(r.pageId)+'" data-start="'+r.start+'"><strong>Seite '+r.page+'</strong><span>'+esc(r.snippet)+'</span></button>').join(''):'<small>Keine Treffer</small>')+'</div>':'')+'</section>';
  }

  html+='<div class="v14-canvas"><div class="paper '+esc(p.paper||'ruled')+'">'+
    '<textarea id="noteText" '+(state.noteMode==='view'?'readonly':'')+' class="'+(state.noteMode==='edit'&&state.noteTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(p.text||'')+'</textarea>'+
    '<canvas id="noteCanvas" width="1000" height="1400"></canvas>'+
    '<div id="imageLayer">'+(p.images||[]).map(img=>'<img data-image-id="'+esc(img.id)+'" class="'+(state.selectedImage===img.id?'selected':'')+'" src="'+img.src+'" style="left:'+img.x+'%;top:'+img.y+'%;width:'+img.w+'%;">').join('')+'</div>'+
    v14EditorContext(n,p)+
  '</div></div>';

  html+='<footer class="v14-editorbar"><button data-action="toggle-pages">'+icon('note',19)+'<span>Seiten</span></button><button data-action="template-menu">'+icon('grid',19)+'<span>Vorlage</span></button><span></span><button class="learn" data-action="note-study">'+icon('play',17)+'<span>Lernen</span></button></footer>';

  if(state.pagesSheetOpen){
    html+='<div class="v14-dim" data-action="toggle-pages"></div><section class="v14-pagesheet" role="dialog" aria-modal="true"><div class="v14-sheetgrabber"></div><header><h2>Seiten</h2><button data-action="add-page">'+icon('plus',20)+'</button></header><div class="v14-pagescroller">'+pages.map((pg,i)=>'<button data-action="open-page" data-id="'+esc(pg.id)+'" class="'+(pg.id===p.id?'active':'')+'">'+v14Preview(pg,true)+'<small>Seite '+(i+1)+'</small></button>').join('')+'</div></section>';
  }

  html+='<div id="noteMenu" class="v14-contextmenu note hidden"><button data-action="toggle-doc-search">'+icon('search',17)+' Im Dokument suchen</button><button data-action="note-mode" data-mode="'+(state.noteMode==='edit'?'view':'edit')+'">'+icon('note',17)+' '+(state.noteMode==='edit'?'Ansicht':'Bearbeiten')+'</button><button data-action="note-info">'+icon('text',17)+' Details</button><button data-action="mark-note-review">'+icon('repeat',17)+' Wiederholen</button><button data-action="export-note">'+icon('download',17)+' Exportieren</button><button data-action="duplicate-note">'+icon('copy',17)+' Duplizieren</button><button class="danger" data-action="delete-note">'+icon('trash',17)+' Löschen</button></div>';

  html+='<section id="templateMenu" class="v14-actionsheet hidden" role="dialog" aria-modal="true"><div class="v14-sheetgrabber"></div><header><h2>Seitenvorlage</h2><button data-action="close-template">'+icon('close',19)+'</button></header><div class="v14-templategrid">'+['plain','ruled','grid','dotted','cornell'].map(kind=>'<button data-action="set-paper" data-paper="'+kind+'"><span class="template '+kind+'"></span><small>'+paperName(kind)+'</small></button>').join('')+'</div></section>';

  if(state.noteInfo){
    html+='<div class="v14-dim"></div><section class="v14-alert"><h2>Dokument</h2><label>Titel<input id="infoTitle" value="'+esc(n.title)+'"></label><label>Fach<input id="infoSubject" value="'+esc(n.subject||'')+'"></label><div><button data-action="close-note-info">Fertig</button><button data-action="pin-note">'+(n.pinned?'Loslösen':'Anpinnen')+'</button></div></section>';
  }

  html+='</section>';root.innerHTML=html;
  const title=$('#noteTitle');if(title)title.oninput=e=>patchNote({title:e.target.value});
  const infoTitle=$('#infoTitle');if(infoTitle)infoTitle.oninput=e=>patchNote({title:e.target.value});
  const infoSubject=$('#infoSubject');if(infoSubject)infoSubject.oninput=e=>patchNote({subject:e.target.value});
  const ds=$('#docSearchInput');if(ds){ds.oninput=e=>{const pos=e.target.selectionStart??e.target.value.length;state.docSearchQuery=e.target.value;renderNotes();v14RestoreInput('docSearchInput',pos);};requestAnimationFrame(()=>{const x=$('#docSearchInput');if(x&&!document.activeElement?.id){x.focus();x.setSelectionRange(x.value.length,x.value.length);}});}
  bindNote(n,p);
}


function renderTrophies(){
  state.screen='trophies';evalTrophies();
  const s=stats(),t=load(KEYS.trophies,{unlocked:{}}),score=trophyScore(),ws=weekStats();
  const locked=TROPHIES.filter(x=>!t.unlocked[x.id]).sort((a,b)=>(s[b.metric]/b.target)-(s[a.metric]/a.target));
  const next=locked[0],unlocked=Object.keys(t.unlocked).length;
  let html='<header class="v14-compactnav"><button data-action="back">'+icon('back',21)+'</button><strong>Pokale</strong><span></span></header>'+
    '<main class="v14-trophies"><section class="v14-achievement-summary"><div><span>Stufe</span><strong>'+esc(league(score))+'</strong><small>'+score+' Punkte</small></div><div><span>Freigeschaltet</span><strong>'+unlocked+' / '+TROPHIES.length+'</strong><small>Sammlung</small></div></section>';
  if(next){
    const cur=Math.min(next.target,s[next.metric]||0),pct=Math.min(100,Math.round(cur/next.target*100));
    html+='<section class="v14-section">'+v14Section('Als Nächstes')+'<article class="v14-achievement next"><span>'+icon('trophy',20)+'</span><div><strong>'+esc(next.name)+'</strong><small>'+esc(next.desc)+'</small><div class="v14-achievement-progress"><i style="width:'+pct+'%"></i></div><em>'+cur+' / '+next.target+'</em></div></article></section>';
  }
  html+='<section class="v14-section">'+v14Section('Diese Woche')+'<div class="v14-weekrows"><div><span>Lernrunden</span><strong>'+ws.sessions+' / 5</strong><i><b style="width:'+Math.min(100,ws.sessions/5*100)+'%"></b></i></div><div><span>Wiederholungen</span><strong>'+ws.reviews+' / 2</strong><i><b style="width:'+Math.min(100,ws.reviews/2*100)+'%"></b></i></div></div></section>'+
    '<section class="v14-section">'+v14Section('Sammlung')+'<div class="v14-achievement-list">'+TROPHIES.map(x=>{const on=!!t.unlocked[x.id],cur=Math.min(x.target,s[x.metric]||0);return '<article class="v14-achievement '+(on?'unlocked':'')+'"><span>'+icon('trophy',19)+'</span><div><strong>'+esc(x.name)+'</strong><small>'+esc(x.desc)+'</small>'+(on?'<em>+'+x.points+' Punkte</em>':'<em>'+cur+' / '+x.target+'</em>')+'</div></article>';}).join('')+'</div></section></main>';
  root.innerHTML='<main class="v14-app">'+html+'</main>';
}

function render(){
  if(state.screen==='home')renderHome();
  else if(state.screen==='library')renderLibrary();
  else if(state.screen==='noteslist')renderNotesList();
  else if(state.screen==='notes')renderNotes();
  else if(state.screen==='reviews')renderReviews();
  else if(state.screen==='trophies')renderTrophies();
  else if(state.screen==='create')renderCreate(state.createMode);
}

window.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(a==='home'){state.screen='home';state.quickCreateOpen=false;history.replaceState(null,'','/');v14Haptic();v14Transition(()=>renderHome());}
  else if(a==='open-create-sheet'){state.quickCreateOpen=true;v14Haptic();v14RenderCurrent();}
  else if(a==='close-create-sheet'){state.quickCreateOpen=false;v14RenderCurrent();}
  else if(a==='library-options'){state.libraryOptionsOpen=true;renderLibrary();}
  else if(a==='close-library-options'){state.libraryOptionsOpen=false;renderLibrary();}
  else if(a==='open-sort-sheet'){state.sortSheetOpen=true;renderLibrary();}
  else if(a==='close-sort-sheet'){state.sortSheetOpen=false;renderLibrary();}
  else if(a==='set-sort'){state.librarySort=b.dataset.sort||'recent';state.sortSheetOpen=false;renderLibrary();}
  else if(a==='quick-pin'){const id=b.dataset.id;data.setNotes(data.notes().map(n=>n.id===id?Object.assign({},n,{pinned:!n.pinned,updatedAt:Date.now()}):n));v14Haptic();v14RenderCurrent();}
  else if(a==='quick-delete'){const id=b.dataset.id;if(v14DeleteDocument(id)){state.docContextId=null;v14Haptic(16);toast('Dokument gelöscht');v14RenderCurrent();}}
  else if(a==='close-doc-context'){state.docContextId=null;state.moveSheetOpen=false;v14RenderCurrent();}
  else if(a==='context-open'){const id=state.docContextId;const origin=state.screen;state.docContextId=null;state.moveSheetOpen=false;if(id){state.editorReturn=origin;state.noteId=id;state.pageId=data.notes().find(n=>n.id===id)?.pages?.[0]?.id;state.noteMode='view';state.screen='notes';renderNotes();}}
  else if(a==='context-pin'){const id=state.docContextId;data.setNotes(data.notes().map(n=>n.id===id?Object.assign({},n,{pinned:!n.pinned,updatedAt:Date.now()}):n));state.docContextId=null;v14Haptic();v14RenderCurrent();}
  else if(a==='context-move'){state.moveSheetOpen=true;v14RenderCurrent();}
  else if(a==='move-context-note'){const id=state.docContextId,folder=b.dataset.folder;data.setNotes(data.notes().map(n=>n.id===id?Object.assign({},n,{folderId:folder==='none'?null:folder,updatedAt:Date.now()}):n));state.docContextId=null;state.moveSheetOpen=false;v14Haptic();v14RenderCurrent();}
  else if(a==='context-duplicate'){const id=state.docContextId;if(id){state.noteId=id;duplicateNote();state.docContextId=null;state.screen='notes';}}
  else if(a==='context-export'){const id=state.docContextId;if(id){state.noteId=id;state.pageId=data.notes().find(n=>n.id===id)?.pages?.[0]?.id;exportNote();state.docContextId=null;v14RenderCurrent();}}
  else if(a==='context-delete'){const id=state.docContextId;if(id&&v14DeleteDocument(id)){toast('Dokument gelöscht');}state.docContextId=null;state.moveSheetOpen=false;v14Haptic(16);v14RenderCurrent();}
  else if(a==='toggle-pages'){state.pagesSheetOpen=!state.pagesSheetOpen;renderNotes();}
  else if(a==='review-rate'){
    const q=state.challenge.questions[state.q],list=data.reviews(),r=list.find(x=>x.prompt===q.prompt);
    if(r){
      const rate=b.dataset.rate;
      if(rate==='again'){r.stage=0;r.dueAt=Date.now()+10*60000;}
      else if(rate==='hard'){r.stage=Math.max(1,r.stage||0);r.dueAt=Date.now()+86400000;}
      else if(rate==='good'){r.stage=(r.stage||0)+1;r.dueAt=Date.now()+[1,3,7,14,30][Math.min(4,r.stage-1)]*86400000;}
      else {r.stage=(r.stage||0)+2;r.dueAt=Date.now()+[3,7,14,30,60][Math.min(4,r.stage-1)]*86400000;}
      data.setReviews(list);
    }
    if(state.q>=state.challenge.questions.length-1)finishChallenge();else{state.q++;state.answered=false;renderQuestion();}
  }
  else if(a==='back'){if(state.screen==='trophies'){state.screen='home';history.replaceState(null,'','/');renderHome();}else{state.screen='home';renderHome();}}
  else if(a==='library'){state.screen='library';state.quickCreateOpen=false;state.newMenu=false;v14Haptic();v14Transition(()=>renderLibrary());}
  else if(a==='editor-back'){
    const target=state.editorReturn||'library';state.noteInfo=false;state.pagesSheetOpen=false;state.toolMenu=false;state.docSearchOpen=false;
    if(target==='home'){state.screen='home';v14Transition(()=>renderHome());}
    else if(target==='noteslist'){state.screen='noteslist';v14Transition(()=>renderNotesList());}
    else {state.screen='library';v14Transition(()=>renderLibrary());}
  }
  else if(a==='library-pinned'){state.screen='library';state.libraryTab='pinned';state.libraryFolder='all';renderLibrary();}
  else if(a==='library-new'){state.quickCreateOpen=true;v14Haptic();renderLibrary();}
  else if(a==='new-folder'){state.quickCreateOpen=false;state.newMenu=false;state.folderModal=true;state.folderModalMode='create';state.folderEditId=null;renderLibrary();}
  else if(a==='close-folder-modal'){state.folderModal=false;state.folderEditId=null;renderLibrary();}
  else if(a==='create-folder')createFolder($('#folderNameInput')?.value||'');
  else if(a==='folder-more'){state.folderMenu=!state.folderMenu;renderLibrary();}
  else if(a==='rename-folder'){state.folderEditId=state.libraryFolder;state.folderModalMode='rename';state.folderModal=true;state.folderMenu=false;renderLibrary();}
  else if(a==='save-folder-name')renameFolder(state.folderEditId,$('#folderNameInput')?.value||'');
  else if(a==='delete-folder')deleteFolder(state.libraryFolder);
  else if(a==='open-folder'){state.libraryFolder=b.dataset.id||'all';state.libraryTab='notes';state.folderMenu=false;renderLibrary();}
  else if(a==='all-folders'){state.libraryFolder='all';state.folderMenu=false;renderLibrary();}
  else if(a==='notes'){state.screen='noteslist';state.noteMode='view';state.selectedImage=null;v14Haptic();v14Transition(()=>renderNotesList());}
  else if(a==='reviews'){state.screen='reviews';v14Haptic();v14Transition(()=>renderReviews());}
  else if(a==='trophies'){state.screen='trophies';history.replaceState(null,'','/trophies');renderTrophies();}
  else if(a==='new-note'){state.quickCreateOpen=false;state.newMenu=false;state.editorReturn=state.screen==='noteslist'?'noteslist':(state.screen==='home'?'home':'library');newNote();}
  else if(a==='new-note-from-list'){state.editorReturn='noteslist';newNote();}
  else if(a==='open-note'){v14Transition(()=>{state.editorReturn=state.screen;state.noteId=b.dataset.id;state.pageId=data.notes().find(n=>n.id===state.noteId)?.pages?.[0]?.id;state.noteMode='view';state.noteNav='pages';state.screen='notes';renderNotes();});}
  else if(a==='open-page'){state.pageId=b.dataset.id;state.pagesSheetOpen=false;state.selection=null;state.selectedImage=null;renderNotes();}
  else if(a==='add-page')addPage();
  else if(a==='library-tab'){state.libraryTab=b.dataset.tab;state.libraryOptionsOpen=false;if(state.libraryTab==='notes')state.libraryFolder='all';v14Haptic();renderLibrary();}
  else if(a==='toggle-library-view'){state.libraryView=state.libraryView==='list'?'grid':'list';renderLibrary();}
  else if(a==='backup')backup();
  else if(a==='restore-note')restoreNote(b.dataset.id);
  else if(a==='purge-note')purgeNote(b.dataset.id);
  else if(a==='note-mode'){state.noteMode=b.dataset.mode;state.selection=null;state.selectedImage=null;renderNotes();}
  else if(a==='note-nav'){state.noteNav=b.dataset.nav||'pages';renderNotes();}
  else if(a==='toggle-tool-menu'){state.toolMenu=!state.toolMenu;renderNotes();}
  else if(a==='toggle-doc-search'){state.docSearchOpen=!state.docSearchOpen;if(!state.docSearchOpen)state.docSearchQuery='';renderNotes();}
  else if(a==='doc-search-result'){state.pageId=b.dataset.page;state.jumpStart=Number(b.dataset.start||0);state.docSearchOpen=false;state.docSearchQuery='';state.noteMode='edit';state.noteTool='text';renderNotes();}
  else if(a==='note-tool'){state.noteTool=b.dataset.tool;state.toolMenu=false;state.selectedImage=null;v14Haptic();renderNotes();}
  else if(a==='note-color'){state.color=b.dataset.color;updateRecentColor(state.color);if(state.selection&&state.selection.noteId===state.noteId)recolorSelection();else renderNotes();}
  else if(a==='pen-size'){state.penSize=+b.dataset.size;renderNotes();}
  else if(a==='marker-size'){state.markerSize=+b.dataset.size;renderNotes();}
  else if(a==='eraser-size'){state.eraserSize=+b.dataset.size;renderNotes();}
  else if(a==='eraser-mode'){state.eraserMode=b.dataset.mode||'precision';renderNotes();}
  else if(a==='copy-selection')copySelection();
  else if(a==='delete-selection')deleteSelection();
  else if(a==='recolor-selection')recolorSelection();
  else if(a==='shape-kind'){state.shapeKind=b.dataset.kind;renderNotes();}
  else if(a==='undo')undo();
  else if(a==='redo')redo();
  else if(a==='favorite-note'){const n=getNote();patchNote({favorite:!n.favorite});renderNotes();}
  else if(a==='pin-note'){const n=getNote();patchNote({pinned:!n.pinned});renderNotes();}
  else if(a==='note-info'){state.noteInfo=true;$('#noteMenu')?.classList.add('hidden');renderNotes();}
  else if(a==='close-note-info'){state.noteInfo=false;renderNotes();}
  else if(a==='focus-note'){state.focus=!state.focus;renderNotes();}
  else if(a==='prev-page'||a==='next-page'){const n=getNote(),pages=n?.pages||[],i=pages.findIndex(p=>p.id===state.pageId),j=i+(a==='next-page'?1:-1);if(pages[j]){state.pageId=pages[j].id;state.selection=null;state.selectedImage=null;renderNotes();}}
  else if(a==='template-menu')$('#templateMenu')?.classList.remove('hidden');
  else if(a==='close-template')$('#templateMenu')?.classList.add('hidden');
  else if(a==='set-paper'){patchPage({paper:b.dataset.paper});renderNotes();}
  else if(a==='note-more')$('#noteMenu')?.classList.toggle('hidden');
  else if(a==='page-more')$('#pageMenu')?.classList.toggle('hidden');
  else if(a==='bookmark-page'){const p=getPage();patchPage({bookmark:!p.bookmark});renderNotes();}
  else if(a==='page-left')movePage(-1);
  else if(a==='page-right')movePage(1);
  else if(a==='duplicate-page')duplicatePage();
  else if(a==='delete-page')deletePage();
  else if(a==='mark-note-review'){markNoteForReview();$('#noteMenu')?.classList.add('hidden');}
  else if(a==='toggle-split'){const ch=splitChallenge(getNote());if(!ch){toast('Die Notiz braucht etwas mehr Text');}else{state.splitStudy=!state.splitStudy;state.splitReveal=false;renderNotes();}}
  else if(a==='split-reveal'){state.splitReveal=true;renderNotes();}
  else if(a==='split-next'){const ch=splitChallenge(getNote());if(ch){state.splitIndex=(state.splitIndex+1)%ch.questions.length;state.splitReveal=false;renderNotes();}}
  else if(a==='split-full'){const ch=splitChallenge(getNote());if(ch)startChallenge(ch,'normal');}
  else if(a==='jump-outline'){state.jumpStart=Number(b.dataset.start||0);state.noteMode='edit';state.noteTool='text';renderNotes();}
  else if(a==='duplicate-note')duplicateNote();
  else if(a==='delete-note')softDelete(state.noteId);
  else if(a==='export-note')exportNote();
  else if(a==='image-smaller')resizeSelectedImage(.9);
  else if(a==='image-larger')resizeSelectedImage(1.1);
  else if(a==='image-delete')deleteSelectedImage();
  else if(a==='note-study')startNoteStudy();
  else if(a==='create-photo'){state.quickCreateOpen=false;state.createError='';state.screen='create';state.createMode='photo';v14Transition(()=>renderCreate('photo'));}
  else if(a==='create-text'){state.quickCreateOpen=false;state.createError='';state.screen='create';state.createMode='text';v14Transition(()=>renderCreate('text'));}
  else if(a==='analyze')analyze();
  else if(a==='answer'){v14Haptic(10);checkAnswer(b.dataset.value);}
  else if(a==='submit-answer')checkAnswer($('#answerInput')?.value||'');
  else if(a==='next-question'){if(state.q>=state.challenge.questions.length-1)finishChallenge();else{state.q++;state.answered=false;renderQuestion();}}
  else if(a==='start-due')startDue();
  else if(a==='play-round'){const r=data.rounds().find(x=>x.id===b.dataset.id);if(r)startChallenge(r,'normal');}
});
window.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&$('#answerInput')&&state.challenge&&!state.answered){checkAnswer($('#answerInput').value);return;}
  if(state.screen==='notes'&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){
    e.preventDefault();if(e.shiftKey)redo();else undo();return;
  }
  if(state.screen==='notes'&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}
  if(state.screen==='notes'&&(e.key==='Delete'||e.key==='Backspace')&&state.selection?.ids?.length&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();deleteSelection();return;}
  if(e.key==='Escape'){
    state.noteInfo=false;state.folderModal=false;state.folderMenu=false;state.newMenu=false;state.toolMenu=false;state.docSearchOpen=false;
    if(state.screen==='notes')renderNotes();else if(state.screen==='library')renderLibrary();
  }
});
window.addEventListener('popstate',()=>{state.screen=location.pathname==='/trophies'?'trophies':'home';render();});

try{render();}catch(err){console.error(err);root.innerHTML='<main class="fatal"><h1>SnapStudy</h1><p>Die App konnte nicht gestartet werden.</p><button onclick="location.reload()">Neu laden</button></main>';}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{}));}
