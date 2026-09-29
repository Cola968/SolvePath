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

const KEYS = {
  notes:'ss10:notes', rounds:'ss10:rounds', reviews:'ss10:reviews', profile:'ss10:profile',
  trophies:'ss10:trophies', activity:'ss10:activity', deleted:'ss10:deleted', folders:'ss12:folders'
};
function defaultNote(){
  return {id:uid('note'),title:'Gravitation',subject:'Physik',paper:'ruled',favorite:false,pinned:false,createdAt:Date.now(),updatedAt:Date.now(),
    text:'Gravitationskraft\nF = G · m₁m₂ / r²\n\nWenn sich r verdoppelt, wird die Kraft viermal kleiner.',images:[],shapes:[]};
}
function migrate(){
  let notes=load(KEYS.notes,null);
  if(!notes){
    const legacy=load('snapstudy-notes-v4',load('snapstudy-notes',null));
    notes=Array.isArray(legacy)&&legacy.length?legacy.map(n=>Object.assign({subject:'Physik',paper:'ruled',favorite:false,pinned:false,createdAt:n.updatedAt||Date.now(),updatedAt:Date.now(),images:[],shapes:[]},n)):[defaultNote()];
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
  const notes=load(KEYS.notes,[]),next=[];
  notes.forEach(n=>{
    if(Array.isArray(n.pages)&&n.pages.length){next.push(n);return;}
    const pageId=uid('page');
    const page={id:pageId,title:'Seite 1',text:String(n.text||''),paper:n.paper||'ruled',images:Array.isArray(n.images)?n.images:[],shapes:Array.isArray(n.shapes)?n.shapes:[],bookmark:false};
    const oldStrokes=load('ss10:strokes:'+n.id,[]);
    if(oldStrokes.length&&!localStorage.getItem('ss12:strokes:'+n.id+':'+pageId))save('ss12:strokes:'+n.id+':'+pageId,oldStrokes);
    next.push(Object.assign({},n,{folderId:n.folderId||null,tags:Array.isArray(n.tags)?n.tags:[],pages:[page]}));
  });
  save(KEYS.notes,next);
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
  noteMode:'view', noteTool:'pen', penSize:5, markerSize:24, eraserSize:55, color:'#20242B',
  selection:null, history:{}, redo:{}, focus:false, noteNav:'pages', splitStudy:false, splitReveal:false, splitIndex:0, noteInfo:false, selectedImage:null, jumpStart:null,
  libraryTab:'notes', libraryView:'list', libraryQuery:'', librarySort:'recent', librarySubject:'all', libraryFolder:'all', newMenu:false,
  recentColors:load('ss11:recentColors',['#20242B','#3568D4','#B75850','#26785B','#D39A23']),
  createMode:'photo', createText:'', createFile:null, createPreview:'', challenge:null, q:0, answered:false, score:0, lastCorrect:false, lastExplanation:'', quizMode:'normal',
  toast:''
};

function toast(msg){
  state.toast=msg; const old=$('.toast'); if(old) old.remove();
  const el=document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
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
  data.setNotes(notes);const s=$('#saveStatus');if(s)s.textContent='Gespeichert';
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
function noteOutline(page){
  const text=String(page?.text||''),lines=text.split('\n'),out=[];let pos=0;
  lines.forEach((raw,i)=>{const line=raw.trim(),start=pos;pos+=raw.length+1;if(!line)return;const heading=i===0||line.endsWith(':')||(/^[A-ZÄÖÜ0-9][^.!?]{2,55}$/u.test(line)&&!/[=+*/]/.test(line));if(heading&&out.length<12)out.push({label:line.replace(/:$/,''),start});});
  return out;
}
function subjectList(){return [...new Set(data.notes().map(n=>n.subject||'Ohne Fach'))].sort((a,b)=>a.localeCompare(b,'de'));}
function folderName(id){return data.folders().find(f=>f.id===id)?.name||'';}
function createFolder(name){
  name=String(name||'').trim();if(!name)return;
  const folder={id:uid('folder'),name,createdAt:Date.now()};data.setFolders([...data.folders(),folder]);state.libraryFolder=folder.id;renderLibrary();
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
  return '<article class="row"><button data-action="open-note" data-id="'+esc(n.id)+'"><span class="fileicon">'+icon('note',17)+'</span><span class="rowcopy"><strong>'+esc(n.title||'Unbenannt')+'</strong><small>'+esc(n.subject||'Ohne Fach')+' · '+(n.updatedAt?fmtDate(n.updatedAt):'')+'</small></span></button><span class="rowmarks">'+marks+'</span></article>';
}
function roundRow(r){
  return '<article class="row"><button data-action="play-round" data-id="'+esc(r.id)+'"><span class="fileicon blue">'+icon('stack',17)+'</span><span class="rowcopy"><strong>'+esc(r.title||'Lernrunde')+'</strong><small>'+esc(r.topic||'')+' · '+(r.questions?.length||0)+' Fragen</small></span></button></article>';
}

function renderHome(){
  evalTrophies();
  const notes=data.notes().slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  const pinned=notes.filter(n=>n.pinned).slice(0,3),due=data.reviews().filter(r=>(r.dueAt||0)<=Date.now()),ws=weekStats();
  const score=trophyScore(),unlocked=load(KEYS.trophies,{unlocked:{}}).unlocked;
  const locked=TROPHIES.filter(t=>!unlocked[t.id]).sort((a,b)=>((stats()[b.metric]||0)/b.target)-((stats()[a.metric]||0)/a.target));
  const next=locked[0];
  root.innerHTML=shell(
    '<section class="pagehead"><h1>Heute</h1></section>'+
    '<button class="progress-strip" data-action="trophies"><span class="cupbox">'+icon('trophy',18)+'</span><div><strong>'+league(score)+' · '+score+' Punkte</strong><small>'+(next?'Nächster Pokal: '+esc(next.name):'Alle Pokale freigeschaltet')+'</small></div>'+icon('arrow',14)+'</button>'+
    '<section class="review-strip"><div><strong>Wiederholen</strong><span>'+(due.length?due.length+' fällig':'Nichts fällig')+'</span></div>'+(due.length?'<button data-action="start-due">Starten</button>':'')+'</section>'+
    '<section class="section"><h2>Neu</h2><div class="quick"><button data-action="new-note">'+icon('note',18)+'<span>Notiz</span></button><button data-action="create-photo">'+icon('camera',18)+'<span>Foto</span></button><button data-action="create-text">'+icon('text',18)+'<span>Text</span></button></div></section>'+
    (pinned.length?'<section class="section"><div class="sectionhead"><h2>Angepinnt</h2><button data-action="library-pinned">Alle</button></div><div class="rows">'+pinned.map(noteRow).join('')+'</div></section>':'')+
    '<section class="section"><div class="sectionhead"><h2>Zuletzt</h2><button data-action="library">Alle</button></div><div class="rows">'+(notes.length?notes.slice(0,4).map(noteRow).join(''):'<div class="emptyline">Keine Notizen</div>')+'</div></section>'+
    '<section class="weekline"><span>Diese Woche</span><strong>'+ws.sessions+' Runden · '+ws.reviews+' Wiederholungen</strong></section>',
    'home'
  );
}
function renderLibrary(){
  let notes=data.notes(),rounds=data.rounds(),deleted=data.deleted(),q=state.libraryQuery.trim().toLowerCase();
  if(state.librarySubject!=='all')notes=notes.filter(n=>(n.subject||'Ohne Fach')===state.librarySubject);
  if(q){notes=notes.filter(n=>(String(n.title||'')+' '+String(n.text||'')+' '+String(n.subject||'')).toLowerCase().includes(q));rounds=rounds.filter(r=>(String(r.title||'')+' '+String(r.topic||'')).toLowerCase().includes(q));}
  if(state.libraryTab==='favorites')notes=notes.filter(n=>n.favorite);
  if(state.libraryTab==='pinned')notes=notes.filter(n=>n.pinned);
  notes=notes.slice().sort((a,b)=>state.librarySort==='title'?String(a.title).localeCompare(String(b.title),'de'):(b.updatedAt||0)-(a.updatedAt||0));
  let body='';
  if(state.libraryTab==='rounds')body=rounds.length?'<div class="rows">'+rounds.map(roundRow).join('')+'</div>':'<div class="empty">Keine Lernrunden</div>';
  else if(state.libraryTab==='deleted')body=deleted.length?'<div class="rows">'+deleted.map(n=>'<article class="row deleted"><div><span class="fileicon">'+icon('trash',16)+'</span><span class="rowcopy"><strong>'+esc(n.title)+'</strong><small>Gelöscht '+fmtDate(n.deletedAt)+'</small></span></div><footer><button data-action="restore-note" data-id="'+n.id+'">Wiederherstellen</button><button data-action="purge-note" data-id="'+n.id+'">Löschen</button></footer></article>').join('')+'</div>':'<div class="empty">Papierkorb ist leer</div>';
  else if(state.libraryView==='grid')body=notes.length?'<div class="docgrid">'+notes.map(n=>'<button data-action="open-note" data-id="'+n.id+'"><span class="sheet '+esc(n.paper||'ruled')+'"></span><strong>'+esc(n.title)+'</strong><small>'+esc(n.subject||'')+(n.pinned?' · angepinnt':'')+'</small></button>').join('')+'</div>':'<div class="empty">Keine Notizen</div>';
  else body=notes.length?'<div class="rows">'+notes.map(noteRow).join('')+'</div>':'<div class="empty">Keine Notizen</div>';

  const subjects=subjectList();
  root.innerHTML=shell(
    '<section class="libraryhead"><h1>Sammlung</h1><button data-action="new-note">'+icon('plus',14)+' Neu</button></section>'+
    '<label class="searchbar">'+icon('search',15)+'<input id="librarySearch" placeholder="Suchen" value="'+esc(state.libraryQuery)+'"></label>'+
    '<div class="tabs">'+[['notes','Notizen'],['pinned','Angepinnt'],['favorites','Favoriten'],['rounds','Lernrunden'],['deleted','Gelöscht']].map(x=>'<button data-action="library-tab" data-tab="'+x[0]+'" class="'+(state.libraryTab===x[0]?'active':'')+'">'+x[1]+'</button>').join('')+'</div>'+
    ((['notes','pinned','favorites'].includes(state.libraryTab))?'<div class="toolbarline"><select id="subjectSelect"><option value="all">Alle Fächer</option>'+subjects.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('')+'</select><select id="sortSelect"><option value="recent">Zuletzt geändert</option><option value="title">Titel</option></select><button data-action="toggle-library-view">'+icon(state.libraryView==='list'?'grid':'list',15)+'</button><span></span><button data-action="backup">'+icon('download',13)+' Sichern</button><label>'+icon('upload',13)+' Import<input id="backupInput" type="file" accept="application/json"></label></div>':'')+
    body,
    'library'
  );
  const search=$('#librarySearch');if(search)search.oninput=e=>{state.libraryQuery=e.target.value;renderLibrary();};
  const subject=$('#subjectSelect');if(subject){subject.value=state.librarySubject;subject.onchange=e=>{state.librarySubject=e.target.value;renderLibrary();};}
  const sort=$('#sortSelect');if(sort){sort.value=state.librarySort;sort.onchange=e=>{state.librarySort=e.target.value;renderLibrary();};}
  const bi=$('#backupInput');if(bi)bi.onchange=e=>restoreBackup(e.target.files?.[0]);
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
    Object.entries(x.strokes||{}).forEach(([key,v])=>{const [nid,pid]=key.split(':');if(nid&&pid)data.setStrokes(nid,pid,v);});
    state.noteId=x.notes[0]?.id;state.pageId=x.notes[0]?.pages?.[0]?.id;toast('Backup importiert');renderLibrary();
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
  const s=$('#saveStatus');if(s)s.textContent='Gespeichert';
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
  const n=getNote();if(!n){newNote();return;}
  const notes=data.notes(),idx=notes.findIndex(x=>x.id===n.id),outline=noteOutline(n),split=splitChallenge(n);
  const sq=split&&split.questions.length?split.questions[state.splitIndex%split.questions.length]:null;
  const navContent=state.noteNav==='outline'
    ?'<aside class="outlinebar">'+(outline.length?outline.map(x=>'<button data-action="jump-outline" data-start="'+x.start+'">'+esc(x.label)+'</button>').join(''):'<small>Keine Überschriften</small>')+'</aside>'
    :'<aside class="pagestrip">'+notes.map((p,i)=>'<button data-action="open-note" data-id="'+p.id+'" class="'+(p.id===n.id?'active':'')+'"><span class="mini-sheet '+esc(p.paper||'ruled')+'"></span><small>'+esc(p.title)+'</small></button>').join('')+(state.noteMode==='edit'?'<button class="addpage" data-action="new-note">'+icon('plus',16)+'<small>Neu</small></button>':'')+'</aside>';
  const palette=state.recentColors.slice(0,5);
  root.innerHTML=shell(
    '<section class="noteshell '+(state.focus?'focus ':'')+(state.noteMode==='view'?'view':'edit')+'">'+
      '<header class="notehead"><button class="iconbtn" data-action="home">'+icon('back',17)+'</button><div class="notetitle"><span>'+esc(n.subject||'Notizen')+' · <i id="saveStatus">Gespeichert</i></span><input id="noteTitle" '+(state.noteMode==='view'?'readonly':'')+' value="'+esc(n.title)+'"></div>'+
      '<div class="modes"><button data-action="note-mode" data-mode="edit" class="'+(state.noteMode==='edit'?'active':'')+'">Bearbeiten</button><button data-action="note-mode" data-mode="view" class="'+(state.noteMode==='view'?'active':'')+'">Ansicht</button></div>'+
      '<button class="iconbtn '+(n.pinned?'blueicon':'')+'" data-action="pin-note" aria-label="Anpinnen">'+icon('pin',16)+'</button>'+
      '<button class="iconbtn '+(n.favorite?'gold':'')+'" data-action="favorite-note" aria-label="Favorit">'+icon('star',16)+'</button>'+
      '<button class="iconbtn" data-action="focus-note" aria-label="Fokus">'+icon('fit',16)+'</button></header>'+
      (!state.focus?'<div class="notenavtabs"><button data-action="note-nav" data-nav="pages" class="'+(state.noteNav==='pages'?'active':'')+'">Seiten</button><button data-action="note-nav" data-nav="outline" class="'+(state.noteNav==='outline'?'active':'')+'">Inhalt</button></div>'+navContent:'')+
      '<main class="noteeditor">'+
        (!state.focus&&state.noteMode==='edit'?'<div class="notetools">'+[['pen','pen'],['marker','marker'],['eraser','eraser'],['select','select'],['text','text'],['shape','shape']].map(x=>'<button title="'+x[0]+'" data-action="note-tool" data-tool="'+x[0]+'" class="'+(state.noteTool===x[0]?'active':'')+'">'+icon(x[1],17)+'</button>').join('')+
          '<i></i>'+palette.map(col=>'<button data-action="note-color" data-color="'+col+'" class="color '+(state.color===col?'active':'')+'" style="--c:'+col+'"></button>').join('')+
          '<label class="customcolor" title="Farbe"><span>+</span><input id="customColor" type="color" value="'+esc(state.color)+'"></label>'+
          '<span></span><button data-action="undo">'+icon('undo',16)+'</button><button data-action="redo">'+icon('redo',16)+'</button><label class="imagepick">'+icon('image',16)+'<input id="imageInput" type="file" accept="image/*"></label></div>':'')+
        (!state.focus&&state.noteMode==='edit'?toolOptions():'')+
        (state.noteMode==='view'?'<div class="viewbar"><button data-action="prev-note" '+(idx<=0?'disabled':'')+'>'+icon('back',14)+' Vorherige</button><span>Seite '+(idx+1)+' / '+notes.length+'</span><button data-action="next-note" '+(idx>=notes.length-1?'disabled':'')+'>Nächste '+icon('arrow',14)+'</button></div>':'')+
        (state.splitStudy&&sq?'<aside class="splitpane"><header><div><small>Lernansicht</small><strong>'+esc(n.title)+'</strong></div><button data-action="toggle-split">'+icon('close',14)+'</button></header><p>'+esc(sq.prompt)+'</p>'+(state.splitReveal?'<div class="splitanswer">'+esc((sq.accepted&&sq.accepted[0])||sq.explanation||'')+'</div>':'<button class="splitreveal" data-action="split-reveal">Antwort anzeigen</button>')+'<footer><button data-action="split-next">Weiter</button><button data-action="split-full">Runde öffnen</button></footer></aside>':'')+
        '<div class="paperstage"><div class="paper '+esc(n.paper||'ruled')+'"><textarea id="noteText" '+(state.noteMode==='view'?'readonly':'')+' class="'+(state.noteMode==='edit'&&state.noteTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(n.text||'')+'</textarea><canvas id="noteCanvas" width="1000" height="1400"></canvas><div id="imageLayer">'+(n.images||[]).map(img=>'<img data-image-id="'+img.id+'" class="'+(state.selectedImage===img.id?'selected':'')+'" src="'+img.src+'" style="left:'+img.x+'%;top:'+img.y+'%;width:'+img.w+'%;">').join('')+'</div></div></div>'+
        (!state.focus?'<footer class="notefoot"><button data-action="note-info">'+esc(n.subject||'Ohne Fach')+'</button><button data-action="template-menu">Vorlage: '+paperName(n.paper)+'</button><span class="grow"></span><button data-action="toggle-split">'+icon('stack',13)+' Split</button><button data-action="export-note">'+icon('download',13)+' Export</button><button data-action="note-study">'+icon('play',13)+' Lernen</button><button data-action="note-more">'+icon('more',14)+'</button></footer>':'')+
      '</main>'+
      '<div id="noteMenu" class="popover hidden"><button data-action="mark-note-review">'+icon('repeat',14)+' Wiederholen</button><button data-action="note-info">'+icon('note',14)+' Details</button><button data-action="duplicate-note">'+icon('copy',14)+' Duplizieren</button><button data-action="delete-note" class="danger">'+icon('trash',14)+' Löschen</button></div>'+
      '<div id="templateMenu" class="template-modal hidden"><div><header><strong>Seitenvorlage</strong><button data-action="close-template">'+icon('close',15)+'</button></header><section>'+['plain','ruled','grid','dotted','cornell'].map(p=>'<button data-action="set-paper" data-paper="'+p+'" class="'+(n.paper===p?'active':'')+'"><span class="template '+p+'"></span><small>'+paperName(p)+'</small></button>').join('')+'</section></div></div>'+
      (state.noteInfo?'<div class="info-modal"><div><header><strong>Dokument</strong><button data-action="close-note-info">'+icon('close',15)+'</button></header><label>Titel<input id="infoTitle" value="'+esc(n.title)+'"></label><label>Fach<select id="infoSubject"><option>Physik</option><option>Mathe</option><option>Geografie</option><option>Englisch</option><option>Sonstige</option></select></label><div class="info-actions"><button data-action="pin-note">'+icon('pin',14)+(n.pinned?' Loslösen':' Anpinnen')+'</button><button data-action="favorite-note">'+icon('star',14)+(n.favorite?' Entfernen':' Favorit')+'</button></div></div></div>':'')+
      (state.selection&&state.selection.noteId===n.id&&state.selection.ids.length?'<div class="selectionbar"><span>'+state.selection.ids.length+' ausgewählt</span><button data-action="copy-selection">'+icon('copy',14)+'</button><button data-action="recolor-selection"><i style="background:'+state.color+'"></i></button><button data-action="delete-selection" class="danger">'+icon('trash',14)+'</button></div>':'')+
      (state.selectedImage?'<div class="imagebar"><span>Bild</span><button data-action="image-smaller">−</button><button data-action="image-larger">+</button><button data-action="image-delete" class="danger">'+icon('trash',14)+'</button></div>':'')+
    '</section>','notes',{wide:true,noTop:true,noNav:state.focus}
  );
  const infoSubject=$('#infoSubject');if(infoSubject){infoSubject.value=n.subject||'Physik';infoSubject.onchange=e=>{patchNote({subject:e.target.value});};}
  const infoTitle=$('#infoTitle');if(infoTitle)infoTitle.oninput=e=>{patchNote({title:e.target.value});const t=$('#noteTitle');if(t)t.value=e.target.value;};
  const custom=$('#customColor');if(custom)custom.oninput=e=>{state.color=e.target.value;updateRecentColor(state.color);renderNotes();};
  bindNote(n);
  if(state.jumpStart!==null){
    requestAnimationFrame(()=>{const t=$('#noteText');if(t){const p=state.jumpStart;state.jumpStart=null;state.noteMode='edit';state.noteTool='text';t.readOnly=false;t.classList.add('editing');t.focus();t.setSelectionRange(p,p);}});
  }
}
function paperName(p){return ({plain:'Blanko',ruled:'Liniert',grid:'Kariert',dotted:'Punktiert',cornell:'Cornell'})[p]||'Liniert';}
function toolOptions(){
  if(state.noteTool==='pen')return '<div class="toolopts"><span>Stift</span><div class="presetdots">'+[3,6,10].map(v=>'<button data-action="pen-size" data-size="'+v+'" class="'+(state.penSize===v?'active':'')+'"><i style="width:'+Math.max(5,v)+'px;height:'+Math.max(5,v)+'px"></i></button>').join('')+'</div><input id="penSize" type="range" min="2" max="16" value="'+state.penSize+'"><b>'+state.penSize+'</b></div>';
  if(state.noteTool==='marker')return '<div class="toolopts"><span>Marker</span><div class="presetdots">'+[18,28,42].map(v=>'<button data-action="marker-size" data-size="'+v+'" class="'+(state.markerSize===v?'active':'')+'"><i class="marker-dot" style="width:'+Math.max(10,v/2)+'px"></i></button>').join('')+'</div><input id="markerSize" type="range" min="12" max="60" value="'+state.markerSize+'"><b>'+state.markerSize+'</b></div>';
  if(state.noteTool==='eraser')return '<div class="toolopts"><span>Radierer</span>'+[30,55,90].map(v=>'<button data-action="eraser-size" data-size="'+v+'" class="'+(state.eraserSize===v?'active':'')+'">'+(v===30?'S':v===55?'M':'L')+'</button>').join('')+'</div>';
  if(state.noteTool==='shape')return '<div class="toolopts"><span>Form</span><button data-action="shape-kind" data-kind="line" class="'+((state.shapeKind||'line')==='line'?'active':'')+'">Linie</button><button data-action="shape-kind" data-kind="rect" class="'+(state.shapeKind==='rect'?'active':'')+'">Rechteck</button><button data-action="shape-kind" data-kind="ellipse" class="'+(state.shapeKind==='ellipse'?'active':'')+'">Ellipse</button></div>';
  if(state.noteTool==='select')return '<div class="toolopts"><span>Lasso</span><small>Bereich wählen und direkt verschieben, kopieren oder färben.</small></div>';
  return '<div class="toolopts"><span>'+state.noteTool.charAt(0).toUpperCase()+state.noteTool.slice(1)+'</span></div>';
}
function bindNote(n){
  const title=$('#noteTitle'),text=$('#noteText'),canvas=$('#noteCanvas'),ctx=canvas?.getContext('2d'),images=$$('#imageLayer img');
  if(title&&!title.readOnly)title.oninput=e=>patchNote({title:e.target.value});
  if(text&&!text.readOnly)text.oninput=e=>patchNote({text:e.target.value});
  const ps=$('#penSize');if(ps)ps.oninput=e=>{state.penSize=+e.target.value;const b=$('.toolopts b');if(b)b.textContent=e.target.value;};
  const ms=$('#markerSize');if(ms)ms.oninput=e=>{state.markerSize=+e.target.value;const b=$('.toolopts b');if(b)b.textContent=e.target.value;};
  const imgInput=$('#imageInput');if(imgInput)imgInput.onchange=e=>addImageToNote(e.target.files?.[0]);
  if(!canvas||!ctx)return;
  let strokes=data.strokes(n.id),drawing=false,current=null,start=null,lasso=null,moveBase=null,moveOrigin=null;

  const pos=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1000,y:(e.clientY-r.top)/r.height*1400};};
  const boundsForIds=(items,ids)=>{
    const pts=items.filter(s=>ids.includes(s.id)).flatMap(s=>s.points||[]);
    if(!pts.length)return null;
    const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
    return{x:Math.min(...xs)-12,y:Math.min(...ys)-12,w:Math.max(...xs)-Math.min(...xs)+24,h:Math.max(...ys)-Math.min(...ys)+24};
  };
  const selectionBox=()=>state.selection&&state.selection.noteId===n.id?boundsForIds(strokes,state.selection.ids):null;
  const renderCanvas=()=>{
    ctx.clearRect(0,0,1000,1400);
    (n.shapes||[]).forEach(s=>{ctx.save();ctx.strokeStyle=s.color;ctx.lineWidth=s.width||5;ctx.beginPath();if(s.kind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);}else if(s.kind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1));}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2);}ctx.stroke();ctx.restore();});
    strokes.forEach(s=>{if(!s.points?.length)return;ctx.save();ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=s.tool==='marker'?.32:1;ctx.stroke();ctx.restore();});
    const box=lasso||selectionBox();
    if(box){ctx.save();ctx.strokeStyle='#3568D4';ctx.fillStyle='rgba(53,104,212,.025)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeRect(box.x,box.y,box.w,box.h);ctx.restore();}
  };
  const segDist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;if(!l)return Math.hypot(p.x-a.x,p.y-a.y);let t=((p.x-a.x)*dx+(p.y-a.y)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));};
  const hit=(s,p,r)=>{for(let i=1;i<s.points.length;i++)if(segDist(p,s.points[i-1],s.points[i])<=r+(s.width||0)/2)return true;return false;};
  const snapshot=()=>{(state.history[n.id]||(state.history[n.id]=[])).push(JSON.stringify(strokes));state.history[n.id]=state.history[n.id].slice(-30);state.redo[n.id]=[];};
  const events=e=>{if(e.getCoalescedEvents){const a=e.getCoalescedEvents();if(a.length)return a.map(pos);}return[pos(e)];};
  const inside=(p,b)=>b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;

  renderCanvas();
  if(state.noteMode==='view'){canvas.style.pointerEvents='none';return;}
  canvas.onpointerdown=e=>{
    e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const p=pos(e);start=p;
    if(state.noteTool==='eraser'){snapshot();strokes=strokes.filter(s=>!hit(s,p,state.eraserSize));data.setStrokes(n.id,strokes);renderCanvas();return;}
    if(state.noteTool==='select'){
      const box=selectionBox();
      if(inside(p,box)&&state.selection?.ids?.length){snapshot();moveBase=JSON.parse(JSON.stringify(strokes));moveOrigin=p;lasso=null;return;}
      state.selection=null;lasso={x:p.x,y:p.y,w:0,h:0};renderCanvas();return;
    }
    if(state.noteTool==='shape'){state.shapeStart=p;return;}
    if(state.noteTool==='text')return;
    snapshot();current={id:uid('s'),tool:state.noteTool==='marker'?'marker':'pen',color:state.noteTool==='marker'?'#E3B53C':state.color,width:state.noteTool==='marker'?state.markerSize:state.penSize,points:[p]};strokes.push(current);renderCanvas();
  };
  canvas.onpointermove=e=>{
    if(!drawing)return;const pts=events(e),p=pts[pts.length-1];
    if(state.noteTool==='eraser'){let changed=false;pts.forEach(q=>{const before=strokes.length;strokes=strokes.filter(s=>!hit(s,q,state.eraserSize));changed=changed||before!==strokes.length;});if(changed){data.setStrokes(n.id,strokes);renderCanvas();}return;}
    if(state.noteTool==='select'&&moveBase&&moveOrigin){
      const dx=p.x-moveOrigin.x,dy=p.y-moveOrigin.y,ids=state.selection.ids;
      strokes=moveBase.map(s=>ids.includes(s.id)?Object.assign({},s,{points:(s.points||[]).map(q=>({x:q.x+dx,y:q.y+dy}))}):s);
      renderCanvas();return;
    }
    if(state.noteTool==='select'&&start){lasso={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};renderCanvas();return;}
    if(current){current.points.push(...pts);renderCanvas();}
  };
  canvas.onpointerup=e=>{
    const p=pos(e);drawing=false;
    if(state.noteTool==='shape'&&state.shapeStart){const a=state.shapeStart,s={id:uid('shape'),kind:state.shapeKind||'line',x1:a.x,y1:a.y,x2:p.x,y2:p.y,color:state.color,width:state.penSize};patchNote({shapes:[...(n.shapes||[]),s]});state.shapeStart=null;renderNotes();return;}
    if(state.noteTool==='select'&&moveBase){data.setStrokes(n.id,strokes);moveBase=null;moveOrigin=null;start=null;renderNotes();return;}
    if(state.noteTool==='select'&&lasso){
      const ids=strokes.filter(s=>{const pts=s.points||[];if(!pts.length)return false;const xs=pts.map(x=>x.x),ys=pts.map(x=>x.y),b={x:Math.min(...xs),y:Math.min(...ys),r:Math.max(...xs),b:Math.max(...ys)};return !(b.x>lasso.x+lasso.w||b.r<lasso.x||b.y>lasso.y+lasso.h||b.b<lasso.y);}).map(s=>s.id);
      state.selection=ids.length?{noteId:n.id,ids}:null;lasso=null;start=null;renderNotes();return;
    }
    if(current){data.setStrokes(n.id,strokes);current=null;patchNote({});}
  };

  images.forEach(img=>{
    if(state.noteMode==='view')return;
    let drag=null;
    img.onpointerdown=e=>{
      e.preventDefault();e.stopPropagation();state.selectedImage=img.dataset.imageId;
      drag={x:e.clientX,y:e.clientY,left:parseFloat(img.style.left),top:parseFloat(img.style.top)};img.setPointerCapture(e.pointerId);
    };
    img.onpointermove=e=>{if(!drag)return;const paper=img.closest('.paper').getBoundingClientRect(),dx=(e.clientX-drag.x)/paper.width*100,dy=(e.clientY-drag.y)/paper.height*100;img.style.left=Math.max(0,Math.min(92,drag.left+dx))+'%';img.style.top=Math.max(0,Math.min(92,drag.top+dy))+'%';};
    img.onpointerup=()=>{if(!drag)return;const id=img.dataset.imageId,arr=(n.images||[]).map(x=>x.id===id?Object.assign({},x,{x:parseFloat(img.style.left),y:parseFloat(img.style.top)}):x);patchNote({images:arr});drag=null;renderNotes();};
  });
}
function deleteSelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId)return;
  const strokes=data.strokes(state.noteId).filter(s=>!sel.ids.includes(s.id));
  data.setStrokes(state.noteId,strokes);state.selection=null;renderNotes();
}
function copySelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId)return;
  const strokes=data.strokes(state.noteId),copies=strokes.filter(s=>sel.ids.includes(s.id)).map(s=>Object.assign({},s,{id:uid('s'),points:(s.points||[]).map(p=>({x:p.x+35,y:p.y+35}))}));
  data.setStrokes(state.noteId,strokes.concat(copies));state.selection={noteId:state.noteId,ids:copies.map(s=>s.id)};renderNotes();
}
function recolorSelection(){
  const sel=state.selection;if(!sel||sel.noteId!==state.noteId)return;
  data.setStrokes(state.noteId,data.strokes(state.noteId).map(s=>sel.ids.includes(s.id)?Object.assign({},s,{color:state.color}):s));renderNotes();
}
function resizeSelectedImage(factor){
  const n=getNote(),id=state.selectedImage;if(!n||!id)return;
  patchNote({images:(n.images||[]).map(x=>x.id===id?Object.assign({},x,{w:Math.max(10,Math.min(80,(x.w||35)*factor))}):x)});renderNotes();
}
function deleteSelectedImage(){
  const n=getNote(),id=state.selectedImage;if(!n||!id)return;
  patchNote({images:(n.images||[]).filter(x=>x.id!==id)});state.selectedImage=null;renderNotes();
}
function addImageToNote(file){
  if(!file)return;const r=new FileReader();r.onload=()=>{const n=getNote(),arr=[...(n.images||[]),{id:uid('img'),src:String(r.result),x:20,y:30,w:35}];patchNote({images:arr});renderNotes();};r.readAsDataURL(file);
}
function undo(){
  const id=state.noteId,st=data.strokes(id),h=state.history[id]||[];if(!h.length)return;const prev=h.pop();(state.redo[id]||(state.redo[id]=[])).push(JSON.stringify(st));data.setStrokes(id,JSON.parse(prev));renderNotes();
}
function redo(){
  const id=state.noteId,r=state.redo[id]||[];if(!r.length)return;const next=r.pop();(state.history[id]||(state.history[id]=[])).push(JSON.stringify(data.strokes(id)));data.setStrokes(id,JSON.parse(next));renderNotes();
}
function exportNote(){
  const n=getNote(),canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1400;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffefb';ctx.fillRect(0,0,1000,1400);ctx.fillStyle='#242830';ctx.font='26px Roboto,Arial';String(n.text||'').split('\n').forEach((line,i)=>ctx.fillText(line,70,70+i*42,850));const strokes=data.strokes(n.id);strokes.forEach(s=>{if(!s.points.length)return;ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.tool==='marker'?.32:1;ctx.lineCap='round';ctx.stroke();ctx.globalAlpha=1;});const a=document.createElement('a');a.download=(n.title||'Notiz')+'.png';a.href=canvas.toDataURL('image/png');a.click();
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
  return {id:uid('round'),title,topic:'Eigener Lernstoff',questions:qs.slice(0,5)};
}
function challengeFromAnalysis(a){
  const q=[];
  if(a?.strategySelection?.question){q.push({prompt:a.strategySelection.question,choices:a.strategySelection.options||[],accepted:[a.strategySelection.correctOption],explanation:a.strategySelection.explanation||''});}
  (a?.reasoningSteps||[]).forEach(x=>q.push({prompt:x.question,choices:x.options||null,accepted:[x.answer].filter(Boolean),explanation:x.explanation||''}));
  if(a?.correctResult?.display)q.push({prompt:'Was ist das Ergebnis?',choices:null,accepted:a.correctResult.acceptedAnswers||[a.correctResult.display],explanation:a.correctResult.explanation||''});
  return {id:uid('round'),title:a?.title||'Lernrunde',topic:a?.topic||'Lernen',questions:q.filter(x=>x.prompt).slice(0,5)};
}
async function analyze(){
  const text=$('#createText')?.value.trim()||'';state.createText=text;
  if(state.createMode==='text'&&text.length<20){toast('Bitte etwas mehr Text einfügen');return;}
  root.innerHTML=shell('<div class="loading"><span></span><strong>Fragen werden erstellt…</strong></div>','home',{back:true,noNav:true});
  try{
    let res;
    if(state.createFile){const fd=new FormData();fd.append('file',state.createFile);if(text)fd.append('text',text);res=await fetch('/api/analyze',{method:'POST',body:fd});}
    else res=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text})});
    if(!res.ok)throw new Error('HTTP '+res.status);const a=await res.json();state.challenge=challengeFromAnalysis(a);if(!state.challenge.questions.length)state.challenge=localChallenge(text);startChallenge(state.challenge,'normal');
  }catch{ if(text.length>=20)startChallenge(localChallenge(text),'normal');else{toast('Analyse nicht erreichbar');renderCreate(state.createMode);} }
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
  const n=getNote();const text=(n.text||'').trim();if(text.length<20){toast('Die Notiz braucht etwas mehr Text');return;}startChallenge(localChallenge(text,n.title),'normal');
}

function render(){
  if(state.screen==='home')renderHome();
  else if(state.screen==='library')renderLibrary();
  else if(state.screen==='notes')renderNotes();
  else if(state.screen==='reviews')renderReviews();
  else if(state.screen==='trophies')renderTrophies();
  else if(state.screen==='create')renderCreate(state.createMode);
}

window.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(a==='home'){state.screen='home';history.replaceState(null,'','/');renderHome();}
  else if(a==='back'){if(state.screen==='trophies'){state.screen='home';history.replaceState(null,'','/');renderHome();}else{state.screen='home';renderHome();}}
  else if(a==='library'){state.screen='library';renderLibrary();}
  else if(a==='library-pinned'){state.screen='library';state.libraryTab='pinned';renderLibrary();}
  else if(a==='notes'){state.screen='notes';state.noteMode='view';state.selectedImage=null;renderNotes();}
  else if(a==='reviews'){state.screen='reviews';renderReviews();}
  else if(a==='trophies'){state.screen='trophies';history.replaceState(null,'','/trophies');renderTrophies();}
  else if(a==='new-note')newNote();
  else if(a==='open-note'){state.noteId=b.dataset.id;state.noteMode='view';state.screen='notes';renderNotes();}
  else if(a==='library-tab'){state.libraryTab=b.dataset.tab;renderLibrary();}
  else if(a==='toggle-library-view'){state.libraryView=state.libraryView==='list'?'grid':'list';renderLibrary();}
  else if(a==='backup')backup();
  else if(a==='restore-note')restoreNote(b.dataset.id);
  else if(a==='purge-note')purgeNote(b.dataset.id);
  else if(a==='note-mode'){state.noteMode=b.dataset.mode;state.selection=null;state.selectedImage=null;renderNotes();}
  else if(a==='note-nav'){state.noteNav=b.dataset.nav||'pages';renderNotes();}
  else if(a==='note-tool'){state.noteTool=b.dataset.tool;state.selectedImage=null;renderNotes();}
  else if(a==='note-color'){state.color=b.dataset.color;updateRecentColor(state.color);if(state.selection&&state.selection.noteId===state.noteId)recolorSelection();else renderNotes();}
  else if(a==='pen-size'){state.penSize=+b.dataset.size;renderNotes();}
  else if(a==='marker-size'){state.markerSize=+b.dataset.size;renderNotes();}
  else if(a==='eraser-size'){state.eraserSize=+b.dataset.size;renderNotes();}
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
  else if(a==='prev-note'||a==='next-note'){const notes=data.notes(),i=notes.findIndex(n=>n.id===state.noteId),j=i+(a==='next-note'?1:-1);if(notes[j]){state.noteId=notes[j].id;renderNotes();}}
  else if(a==='template-menu')$('#templateMenu')?.classList.remove('hidden');
  else if(a==='close-template')$('#templateMenu')?.classList.add('hidden');
  else if(a==='set-paper'){patchNote({paper:b.dataset.paper});renderNotes();}
  else if(a==='note-more')$('#noteMenu')?.classList.toggle('hidden');
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
  else if(a==='create-photo'){state.screen='create';state.createMode='photo';renderCreate('photo');}
  else if(a==='create-text'){state.screen='create';state.createMode='text';renderCreate('text');}
  else if(a==='analyze')analyze();
  else if(a==='answer')checkAnswer(b.dataset.value);
  else if(a==='submit-answer')checkAnswer($('#answerInput')?.value||'');
  else if(a==='next-question'){if(state.q>=state.challenge.questions.length-1)finishChallenge();else{state.q++;state.answered=false;renderQuestion();}}
  else if(a==='start-due')startDue();
  else if(a==='play-round'){const r=data.rounds().find(x=>x.id===b.dataset.id);if(r)startChallenge(r,'normal');}
});
window.addEventListener('keydown',e=>{if(e.key==='Enter'&&$('#answerInput')&&state.challenge&&!state.answered)checkAnswer($('#answerInput').value);});
window.addEventListener('popstate',()=>{state.screen=location.pathname==='/trophies'?'trophies':'home';render();});

try{render();}catch(err){console.error(err);root.innerHTML='<main class="fatal"><h1>SnapStudy</h1><p>Die App konnte nicht gestartet werden.</p><button onclick="location.reload()">Neu laden</button></main>';}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{}));}
