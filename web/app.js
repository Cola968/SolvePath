const app=document.getElementById('app');const state={file:null,preview:'',challenge:null,qIndex:0,score:0,answered:false,lastCorrect:false,lastExplanation:'',invite:null,textDraft:'',mode:'normal'};
const sampleAnalysis={title:'Gravitationsfeld',topic:'Physik',originalText:'Gravitationskraft und Keplers Gesetze',strategySelection:{question:'Was passiert mit der Gravitationskraft, wenn sich der Abstand verdoppelt?',options:['Sie halbiert sich','Sie wird viermal kleiner','Sie bleibt gleich','Sie wird viermal größer'],correctOption:'Sie wird viermal kleiner',explanation:'Nach F = Gm₁m₂/r² führt doppelter Abstand zu einem Viertel der Kraft.'},reasoningSteps:[{question:'Welche Größe steht im Nenner der Gravitationsformel?',answer:'r²',choices:['r','r²','m²'],explanation:'Der Abstand geht quadratisch ein.'},{question:'Was gilt bei Kepler III?',answer:'T²/a³ ist konstant',choices:['T/a ist konstant','T²/a³ ist konstant','T³/a² ist konstant'],explanation:'Für Bahnen um denselben Zentralkörper ist T²/a³ konstant.'},{question:'Welche Einheit hat die Feldstärke g?',answer:'N/kg',choices:['N/kg','kg/N','m/s'],explanation:'g = F/m, also N/kg.'}],correctResult:{display:'1/4 der ursprünglichen Kraft',acceptedAnswers:['1/4','ein viertel','viertel'],explanation:'Verdopplung von r bedeutet Faktor 4 im Nenner.'}};
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");const norm=v=>String(v||'').toLowerCase().trim().replaceAll(',','.').replace(/\s+/g,'').replace(/[.;:!?]/g,'');const today=()=>new Date().toISOString().slice(0,10);
function profile(){return JSON.parse(localStorage.getItem('snapstudy-profile')||'{"xp":0,"streak":0,"last":""}')}function mistakes(){return JSON.parse(localStorage.getItem('snapstudy-mistakes')||'[]')}function saveMistakes(v){localStorage.setItem('snapstudy-mistakes',JSON.stringify(v.slice(0,20)))}function usage(){const x=JSON.parse(localStorage.getItem('snapstudy-usage')||'{}');return x.day===today()?x.count||0:0}const remaining=()=>Math.max(0,3-usage());function consume(){localStorage.setItem('snapstudy-usage',JSON.stringify({day:today(),count:usage()+1}))}
function buddy(small=false){return '<span class="buddy'+(small?' small':'')+'"><i class="fold"></i><i class="smile">⌣</i></span>'}function stats(){const p=profile();return '<div class="stats"><span class="stat">🔥 '+(p.streak||0)+'</span><span class="stat">⚡ '+(p.xp||0)+'</span></div>'}function topbar(back=false,title='SnapStudy'){return '<div class="topbar">'+(back?'<button class="back" data-action="home">←</button>':buddy(true)+'<div class="brand">'+esc(title)+'</div>')+'<div class="top-spacer"></div>'+(back?buddy(true):stats())+'</div>'}function nav(active='path'){return '<nav class="nav"><button data-action="home" class="'+(active==='path'?'active':'')+'"><span>●</span><span>Pfad</span></button><button data-action="revenge" class="'+(active==='revenge'?'active':'')+'"><span>↻</span><span>Revanche</span></button><button data-action="duel" class="'+(active==='duel'?'active':'')+'"><span>⚔</span><span>Duelle</span></button><button data-action="profile"><span>☺</span><span>Ich</span></button></nav>'}const legacyShell=(c,o={})=>'<main class="shell">'+topbar(!!o.back,o.title||'SnapStudy')+c+(o.nav===false?'':nav(o.active||'path'))+'</main>';
function challengeFromAnalysis(a){const q=[];if(a.strategySelection)q.push({prompt:a.strategySelection.question,choices:a.strategySelection.options||[],accepted:[a.strategySelection.correctOption],explanation:a.strategySelection.explanation||''});(a.reasoningSteps||[]).slice(0,3).forEach(s=>q.push({prompt:s.question,choices:s.choices||[],accepted:[s.answer],explanation:s.explanation||''}));q.push({prompt:'Was ist das Endergebnis?',choices:[],accepted:[a.correctResult?.display,...(a.correctResult?.acceptedAnswers||[])].filter(Boolean),explanation:a.correctResult?.explanation||''});return{title:a.title||'Neue Quest',topic:a.topic||'Lernen',questions:q.slice(0,5)}}
function renderHome(){const m=mistakes();app.innerHTML=legacyShell('<section class="hero"><span class="eyebrow">Heute · dein Lernpfad</span><h1>Dein Stoff.<br>Dein Spiel.</h1><p class="lead">Heute reichen sechs Minuten. Starte mit deinem eigenen Lernstoff.</p></section><div class="path-wrap"><div class="path-line"></div><button class="quest-node node1" data-action="create">⌁</button><div class="node-label label1"><b>Scan Quest</b><span>Foto rein · 5 Fragen</span></div><button class="quest-node node2 '+(m.length?'coral':'locked')+'" data-action="revenge">↻</button><div class="node-label label2"><b>Revanche</b><span>'+(m.length?m.length+' alte Fehler':'nach deinem ersten Fehler')+'</span></div><button class="quest-node yellow-node node3" data-action="duel">⚔</button><div class="node-label label3"><b>Freundesduell</b><span>gleiche Quest teilen</span></div></div><div class="card hook">'+buddy(true)+'<div><b>SnapStudy merkt sich deine Fehler.</b><span class="small">Was heute falsch war, kommt später als Revanche zurück.</span></div></div>',{active:'path'})}
function renderCreate(textOnly=false){const prev=state.preview?'<img class="preview" src="'+esc(state.preview)+'">':'';const upload=textOnly?'':'<div class="upload">'+prev+'<input id="photoInput" type="file" accept="image/*" capture="environment">'+(!state.preview?'<div class="upload-copy"><div class="camera-icon">⌁</div><strong>Foto aufnehmen</strong><span class="small">Arbeitsblatt · Buch · Notizen</span></div>':'')+'</div><div class="tip">'+buddy(true)+'<div><b>Kein Karten-Basteln.</b><br>Ein Foto genügt für deine nächste Runde.</div></div>';app.innerHTML=legacyShell('<section class="hero"><span class="eyebrow">Scan Quest</span><h2>Mach daraus eine Quest.</h2><p class="lead">Fotografiere genau das, was du heute können musst.</p></section><div class="stack">'+upload+'<div><label class="field-label">Optionaler Text</label><textarea id="studyText" placeholder="z. B. Keplers Gesetze">'+esc(state.textDraft)+'</textarea></div><button class="tactile primary block" data-action="analyze">Quest erstellen</button><button class="tactile secondary block" data-action="sample">Demo spielen</button></div>',{back:true,nav:false});const inp=document.getElementById('photoInput');if(inp)inp.onchange=e=>{const f=e.target.files?.[0];if(!f)return;state.file=f;if(state.preview)URL.revokeObjectURL(state.preview);state.preview=URL.createObjectURL(f);renderCreate(false)}}
function renderLoading(){app.innerHTML=legacyShell('<section class="hero center">'+buddy(false)+'<h2>Ich baue deine Quest.</h2><p class="lead">Lernstoff lesen, fünf Fragen bauen, Schwierigkeitsmix prüfen.</p></section><div class="loader"></div>',{nav:false})}
function renderError(msg){app.innerHTML=legacyShell('<section class="hero"><span class="eyebrow">Kurz hängen geblieben</span><h2>Die Analyse antwortet gerade nicht.</h2><p class="lead">Dein Text bleibt erhalten. Du kannst direkt weitermachen.</p></section><div class="error-box"><b>Was passiert ist</b><p class="small" style="margin-top:6px">'+esc(msg)+'</p></div><div class="stack" style="margin-top:14px"><button class="tactile primary block" data-action="retry-analyze">Erneut versuchen</button><button class="tactile secondary block" data-action="continue-text">Mit Text weitermachen</button><button class="tactile yellow block" data-action="sample">Demo-Quest öffnen</button></div>',{back:true,nav:false})}
async function analyze(){const el=document.getElementById('studyText');state.textDraft=el?.value.trim()||state.textDraft;if(!state.file&&state.textDraft.length<8)return renderCreate(true);renderLoading();try{let r;if(state.file){const f=new FormData();f.append('image',state.file);f.append('text',state.textDraft);r=await fetch('/api/analyze',{method:'POST',body:f})}else r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:state.textDraft})});const p=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p.error||'Analysedienst nicht verfügbar.');consume();startChallenge(challengeFromAnalysis(p),'normal')}catch(e){renderError(e?.message||'Analysedienst nicht verfügbar.')}}
function startChallenge(c,mode='normal'){state.challenge=c;state.mode=mode;state.qIndex=0;state.score=0;state.answered=false;renderQuestion()}function correct(q,a){const n=norm(a);return(q.accepted||[]).some(x=>{const c=norm(x);return n===c||(n.length>1&&c.length>1&&(n.includes(c)||c.includes(n)))})}
function addMistake(q){const list=mistakes().filter(x=>x.prompt!==q.prompt);list.unshift({prompt:q.prompt,choices:q.choices||[],accepted:q.accepted||[],explanation:q.explanation||'',at:Date.now()});saveMistakes(list)}
function clearMistake(q){saveMistakes(mistakes().filter(x=>x.prompt!==q.prompt))}
function renderQuestion(){const c=state.challenge,q=c.questions[state.qIndex],pct=((state.qIndex+(state.answered?1:0))/c.questions.length)*100;let answers=q.choices?.length?q.choices.map((x,i)=>'<button class="option" data-action="choice" data-value="'+esc(x)+'">'+String.fromCharCode(65+i)+' · '+esc(x)+'</button>').join(''):'<input id="answerInput" class="text-input" placeholder="Deine Antwort"><button class="tactile primary block" data-action="submit-answer">Antwort prüfen</button>';const feedback=state.answered?'<div class="feedback '+(state.lastCorrect?'good':'bad')+'"><b>'+(state.lastCorrect?'Richtig.':'Noch nicht.')+'</b><br>'+esc(state.lastExplanation)+'</div><button class="tactile primary block" data-action="next">'+(state.qIndex===c.questions.length-1?'Ergebnis ansehen':'Weiter')+'</button>':'';app.innerHTML=legacyShell('<div class="progress-row"><div class="progress"><div style="width:'+pct+'%"></div></div>'+buddy(true)+'</div><div class="question">'+esc(q.prompt)+'</div><div class="stack">'+(state.answered?'':answers)+feedback+'</div>',{nav:false})}
function answer(v){if(state.answered)return;const q=state.challenge.questions[state.qIndex];state.lastCorrect=correct(q,v);state.lastExplanation=q.explanation||'';state.answered=true;if(state.lastCorrect){state.score++;if(state.mode==='revenge')clearMistake(q)}else addMistake(q);renderQuestion()}function next(){if(state.qIndex>=state.challenge.questions.length-1)return renderResult();state.qIndex++;state.answered=false;renderQuestion()}
function renderResult(){const pct=Math.round(state.score/state.challenge.questions.length*100),p=profile();p.xp=(p.xp||0)+pct;p.streak=p.streak||1;localStorage.setItem('snapstudy-profile',JSON.stringify(p));app.innerHTML=legacyShell('<section class="hero center"><span class="eyebrow">'+(state.mode==='revenge'?'Revanche beendet':'Quest beendet')+'</span><h2>'+(pct>=80?'Stark gespielt.':pct>=60?'Gute Runde.':'Noch eine Runde lohnt sich.')+'</h2></section><div class="score"><strong>'+pct+'%</strong></div><div class="card center"><b>'+state.score+' von '+state.challenge.questions.length+' richtig</b><p class="small" style="margin-top:5px">Falsche Antworten sind automatisch in deiner Revanche gespeichert.</p></div><div class="stack" style="margin-top:14px"><button class="tactile primary block" data-action="duel">Freund herausfordern</button><button class="tactile secondary block" data-action="home">Zurück zum Pfad</button></div>',{nav:false})}
function renderRevenge(){const m=mistakes();const body=m.length?m.slice(0,4).map(x=>'<div class="card mistake"><b>'+esc(x.prompt)+'</b><span class="small">Aus einer früheren Runde</span></div>').join(''):'<div class="card center"><b>Noch keine offenen Fehler.</b><p class="small" style="margin-top:5px">Spiel eine Quest. Falsche Antworten landen automatisch hier.</p></div>';app.innerHTML=legacyShell('<section class="hero"><span class="eyebrow">Revanche</span><h1>Deine Fehler bekommen ein Rückspiel.</h1><p class="lead">Kein zufälliges Wiederholen. Nur Dinge, die du wirklich falsch hattest.</p></section><div class="revenge-count"><div><strong>'+m.length+'</strong><span>OFFENE FEHLER</span></div></div><div class="stack">'+body+'</div>'+(m.length?'<button class="tactile yellow block" style="margin-top:16px" data-action="start-revenge">Revanche starten · '+Math.min(m.length,5)+' Fragen</button>':''),{active:'revenge',title:'Revanche'})}
function startRevenge(){const m=mistakes().slice(0,5);if(!m.length)return renderRevenge();startChallenge({title:'Revanche',topic:'Deine Fehler',questions:m},'revenge')}
function renderDuel(){const last=state.challenge;app.innerHTML=legacyShell('<section class="hero"><span class="eyebrow">Freundesduell</span><h1>Gleicher Stoff.<br>Direkter Vergleich.</h1><p class="lead">Schick exakt dieselbe Quest an einen Freund. Kein Account nötig.</p></section><div class="vs"><div class="vs-box"><span>DU</span><strong>'+(last?Math.round(state.score/last.questions.length*100):'—')+'%</strong></div><div class="vs-text">VS</div><div class="vs-box friend"><span>FREUND</span><strong>?</strong></div></div><div class="card"><b>'+(last?esc(last.title):'Noch keine Quest gespielt')+'</b><p class="small" style="margin-top:5px">'+(last?'5 Fragen · identische Reihenfolge · Scorevergleich':'Spiel zuerst eine Quest, dann kannst du sie teilen.')+'</p></div><button class="tactile primary block" style="margin-top:16px" data-action="share" '+(last?'':'disabled')+'>Freund herausfordern</button>',{active:'duel',title:'Duelle'})}
function enc(v){return btoa(unescape(encodeURIComponent(JSON.stringify(v))))}function dec(v){return JSON.parse(decodeURIComponent(escape(atob(v))))}async function share(){if(!state.challenge)return;const u=location.origin+location.pathname+'#challenge='+encodeURIComponent(enc(state.challenge));try{if(navigator.share)await navigator.share({title:'SnapStudy Duell',text:'Schaffst du meine SnapStudy-Quest?',url:u});else{await navigator.clipboard.writeText(u);alert('Duell-Link kopiert.')}}catch{}}
function handleHash(){if(!location.hash.startsWith('#challenge='))return false;try{const c=dec(decodeURIComponent(location.hash.slice(11)));state.invite=c;app.innerHTML=legacyShell('<section class="hero center">'+buddy(false)+'<span class="eyebrow">Duell erhalten</span><h1>Du wurdest herausgefordert.</h1><p class="lead">'+esc(c.title)+'</p></section><button class="tactile primary block" data-action="start-invite">Quest starten</button>',{nav:false});return true}catch{return false}}
app.onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='home')renderHome();if(a==='create'){state.file=null;state.preview='';renderCreate(false)}if(a==='analyze'||a==='retry-analyze')analyze();if(a==='continue-text'){state.file=null;state.preview='';renderCreate(true)}if(a==='sample')startChallenge(challengeFromAnalysis(sampleAnalysis),'normal');if(a==='choice')answer(b.dataset.value||'');if(a==='submit-answer'){const i=document.getElementById('answerInput');if(i?.value.trim())answer(i.value)}if(a==='next')next();if(a==='revenge')renderRevenge();if(a==='start-revenge')startRevenge();if(a==='duel')renderDuel();if(a==='share')share();if(a==='start-invite')startChallenge(state.invite,'invite');if(a==='profile')renderHome()}


/* SnapStudy V4 — product-first UI, no generic AI dashboard patterns */
state.uncertainMarked = false;

const V4_ICONS = {
  today:'<path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 9.5V20h11V9.5"/><path d="M9.5 20v-6h5v6"/>',
  repeat:'<path d="M20 7h-7a7 7 0 1 0 6.2 10.2"/><path d="m17 3 3 4-3 4"/>',
  stack:'<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/>',
  duel:'<path d="m7 4 10 10"/><path d="m17 4-4 4"/><path d="m7 4 4 4"/><path d="m7 20 10-10"/><path d="m4 17 3 3 3-3"/><path d="m14 17 3 3 3-3"/>',
  camera:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M8 6 9.5 3h5L16 6"/><circle cx="12" cy="13" r="3.5"/>',
  text:'<path d="M5 5h14"/><path d="M12 5v14"/><path d="M8.5 19h7"/>',
  arrow:'<path d="M5 12h14"/><path d="m14 7 5 5-5 5"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 17h.01"/>',
  spark:'<path d="m12 3 1.4 4.3L18 9l-4.6 1.7L12 15l-1.4-4.3L6 9l4.6-1.7L12 3Z"/>',
  play:'<path d="m9 7 8 5-8 5V7Z"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.5-4.5"/><path d="m8.2 13.2 7.5 4.5"/>',
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a4 4 0 0 0 4 4"/><path d="M16 6h3v1a4 4 0 0 1-4 4"/><path d="M12 12v5"/><path d="M9 20h6"/>'
};

function v4Icon(name,size){
  return '<svg class="v4-icon" width="'+(size||20)+'" height="'+(size||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(V4_ICONS[name]||'')+'</svg>';
}
function v4Mark(){
  return '<span class="v4-mark" aria-hidden="true"><i class="v4-fold"></i><i class="v4-line l1"></i><i class="v4-line l2"></i><i class="v4-line l3"></i></span>';
}
function v4Load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(_){return fallback}}
function v4Save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function v4Library(){return v4Load('snapstudy-library-v4',[])}
function v4Reviews(){
  let list=v4Load('snapstudy-reviews-v4',[]);
  if(!list.length){
    const old=v4Load('snapstudy-mistakes',[]);
    if(old.length){
      list=old.map(function(x){return{key:(x.sourceTitle||'')+'|'+x.prompt,prompt:x.prompt,choices:x.choices||[],accepted:x.accepted||[],explanation:x.explanation||'',sourceTitle:x.sourceTitle||'Frühere Runde',stage:0,dueAt:Date.now(),reason:'wrong'}});
      v4Save('snapstudy-reviews-v4',list);
    }
  }
  return list;
}
function v4Due(){return v4Reviews().filter(function(x){return (x.dueAt||0)<=Date.now()})}
function v4RoundKey(c){return String(c.title||'Runde')+'|'+(c.questions||[]).map(function(q){return q.prompt}).join('|')}
function v4SaveRound(c){
  const list=v4Library(),key=v4RoundKey(c),old=list.find(function(x){return x.key===key});
  const item={id:old?old.id:'r_'+Date.now().toString(36),key:key,title:c.title||'Lernrunde',topic:c.topic||'Lernen',source:c.source||'',questions:c.questions||[],createdAt:old?old.createdAt:Date.now(),lastPlayedAt:Date.now()};
  v4Save('snapstudy-library-v4',[item].concat(list.filter(function(x){return x.key!==key})).slice(0,20));
  return item;
}
function v4ReviewKey(q,c){return String((c&&c.title)||'')+'|'+String(q.prompt||'')}
function v4PlanReview(q,c,reason){
  const list=v4Reviews(),key=v4ReviewKey(q,c),old=list.find(function(x){return x.key===key});
  const item={key:key,prompt:q.prompt,choices:q.choices||[],accepted:q.accepted||[],explanation:q.explanation||'',sourceTitle:(c&&c.title)||'Lernrunde',topic:(c&&c.topic)||'Lernen',stage:old?old.stage||0:0,dueAt:reason==='uncertain'?Date.now()+86400000:Date.now(),reason:reason||'wrong'};
  v4Save('snapstudy-reviews-v4',[item].concat(list.filter(function(x){return x.key!==key})).slice(0,50));
}
function v4ResolveReview(q,c,ok){
  const list=v4Reviews(),key=v4ReviewKey(q,c),item=list.find(function(x){return x.key===key})||list.find(function(x){return x.prompt===q.prompt});
  if(!item)return;
  if(ok){const days=[1,3,7,14,30];item.stage=Math.min((item.stage||0)+1,days.length-1);item.dueAt=Date.now()+days[item.stage]*86400000;item.reason='reviewed'}
  else{item.stage=0;item.dueAt=Date.now()+1800000;item.reason='wrong'}
  v4Save('snapstudy-reviews-v4',[item].concat(list.filter(function(x){return x.key!==key})));
}
function v4LocalTextChallenge(text){
  const clean=String(text||'').replace(/\s+/g,' ').trim();
  let sentences=clean.split(/(?<=[.!?])\s+/).filter(function(s){return s.length>=18});
  if(!sentences.length)sentences=clean.split(/[,;]\s*/).filter(function(s){return s.length>=12});
  const stop=['dieser','diese','dieses','einer','einem','einen','sowie','werden','wurde','wird','sind','oder','aber','auch','durch','dass','weil','wenn','dann','über','unter','zwischen','gegen','ohne','nach','vor','eine','der','die','das','den','dem','des','und','mit','für','von','ist','im','in','am','an','zu','auf'];
  const qs=[];
  sentences.slice(0,10).forEach(function(sentence){
    if(qs.length>=5)return;
    const words=sentence.match(/[A-Za-zÄÖÜäöüß0-9²³%-]{4,}/g)||[];
    const candidates=words.filter(function(w){return stop.indexOf(w.toLowerCase())===-1}).sort(function(a,b){return b.length-a.length});
    const answer=candidates[0];if(!answer)return;
    qs.push({prompt:'Ergänze: '+sentence.replace(answer,'_____'),choices:[],accepted:[answer],explanation:sentence});
  });
  if(!qs.length)qs.push({prompt:'Nenne den wichtigsten Begriff aus deinem Text.',choices:[],accepted:[clean.split(' ')[0]||clean],explanation:clean});
  while(qs.length<5){const src=qs[qs.length%Math.max(1,qs.length)];qs.push({prompt:'Wiederholung: '+src.prompt,choices:src.choices,accepted:src.accepted,explanation:src.explanation})}
  return{title:'Aus deinem Text',topic:'Eigener Lernstoff',source:clean.slice(0,280),localFallback:true,questions:qs.slice(0,5)};
}
function topbar(back){
  const p=profile();
  return '<header class="v4-header">'+(back?'<button class="v4-icon-btn" data-action="home">'+v4Icon('back',21)+'</button>':'<button class="v4-brand" data-action="home">'+v4Mark()+'<span>SnapStudy</span></button>')+'<div class="v4-headstats"><span>'+v4Icon('trophy',16)+(p.xp||0)+'</span><i></i><span>'+(p.streak||0)+' Tage</span></div></header>';
}
function nav(active){
  const items=[['today','Heute','today'],['reviews','Fehler','repeat'],['library','Sammlung','stack'],['duel','Duelle','duel']];
  return '<nav class="v4-nav">'+items.map(function(x){return'<button data-action="'+x[0]+'" class="'+(active===x[0]?'active':'')+'">'+v4Icon(x[2],21)+'<span>'+x[1]+'</span></button>'}).join('')+'</nav>';
}
function shell(content,back,active,noNav){
  return '<main class="v4-shell">'+topbar(!!back)+'<div class="v4-content">'+content+'</div>'+(noNav?'':nav(active||'today'))+'</main>';
}
function renderHome(){
  const due=v4Due(),lib=v4Library(),p=profile(),recent=lib[0];
  const title=due.length?(due.length+(due.length===1?' Frage ist fällig':' Fragen sind fällig')):(lib.length?'Heute ist nichts offen':'Starte mit deinem Stoff');
  const copy=due.length?'Kurze Wiederholung aus deinen eigenen Fehlern. Danach bist du durch.':(lib.length?'Wiederhole eine alte Runde oder füge neuen Stoff hinzu.':'Fotografiere ein Blatt oder füge Text ein. Daraus werden fünf Fragen.');
  const action=due.length?'<button class="v4-btn primary" data-action="start-due">'+v4Icon('play',18)+'Fehlertraining starten</button>':'<button class="v4-btn primary" data-action="create">'+v4Icon('camera',18)+'Neue Runde erstellen</button>';
  app.innerHTML=shell(
    '<section class="v4-home-intro"><span class="v4-kicker">Für heute</span><h1>'+title+'</h1><p>'+copy+'</p></section>'+
    '<section class="v4-today"><div class="v4-today-top"><span class="v4-today-icon">'+v4Icon(due.length?'repeat':'spark',24)+'</span><div><strong>'+(due.length?'Fehler zuerst':'5-Minuten-Runde')+'</strong><span>'+(due.length?(due.length+' fällig · ca. '+Math.max(2,due.length)+' Min.'):'Dein Stoff, keine fertigen Kurse')+'</span></div></div>'+action+'</section>'+
    '<div class="v4-quick"><button data-action="create">'+v4Icon('camera',21)+'<span><b>Foto</b><small>Blatt scannen</small></span></button><button data-action="create-text">'+v4Icon('text',21)+'<span><b>Text</b><small>Notizen einfügen</small></span></button></div>'+
    (recent?'<section class="v4-section"><div class="v4-section-head"><h2>Zuletzt</h2><button data-action="library">Alle</button></div><article class="v4-recent"><span class="v4-small-icon">'+v4Icon('stack',20)+'</span><div><strong>'+esc(recent.title)+'</strong><span>'+esc(recent.topic)+'</span></div><button data-action="play-library" data-id="'+esc(recent.id)+'">'+v4Icon('play',17)+'</button></article></section>':'')+
    '<section class="v4-difference">'+v4Mark()+'<p><strong>Der Unterschied:</strong> Falsche oder unsichere Antworten verschwinden nicht. Sie werden automatisch für später eingeplant.</p></section>'+
    '<div class="v4-meta"><span>'+remaining()+' neue Erstellungen heute</span><span>'+((p.sessions||0))+' Runden gespielt</span><a href="/privacy/snapstudy" target="_blank" rel="noopener">Datenschutz</a></div>',
    false,'today',false
  );
}
function renderCreate(textOnly){
  const only=!!textOnly,preview=state.preview?'<img class="v4-preview" src="'+esc(state.preview)+'" alt="Ausgewähltes Bild">':'';
  const photo=only?'':'<label class="v4-upload">'+preview+'<input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment">'+(!state.preview?'<span class="v4-upload-icon">'+v4Icon('camera',29)+'</span><strong>Foto aufnehmen oder auswählen</strong><small>Arbeitsblatt, Buchseite oder handschriftliche Notizen</small>':'<span class="v4-replace">Bild ändern</span>')+'</label>';
  app.innerHTML=shell(
    '<section class="v4-page-title"><span class="v4-kicker">Neue Runde</span><h1>'+(only?'Notizen einfügen':'Lernstoff fotografieren')+'</h1><p>'+(only?'Füge genau den Abschnitt ein, den du können musst.':'Nimm nur den relevanten Abschnitt auf. Das macht die Fragen besser.')+'</p></section>'+
    '<div class="v4-switch"><button data-action="create" class="'+(!only?'active':'')+'">'+v4Icon('camera',17)+'Foto</button><button data-action="create-text" class="'+(only?'active':'')+'">'+v4Icon('text',17)+'Text</button></div>'+
    '<div class="v4-create">'+photo+'<label class="v4-textfield"><span>'+(only?'Deine Notizen':'Optional: Kontext oder Korrektur')+'</span><textarea id="studyText" placeholder="z. B. Keplers Gesetze, Gravitationskraft und Kreisbahnen">'+esc(state.textDraft)+'</textarea></label>'+
    '<div class="v4-principle">'+v4Icon('check',18)+'<p><strong>Erst antworten, dann erklären.</strong> SnapStudy zeigt nicht sofort die Lösung. Du musst zuerst selbst abrufen.</p></div>'+
    '<button class="v4-btn primary full" data-action="analyze">'+v4Icon('arrow',18)+'5 Fragen erstellen</button><p class="v4-limit">'+remaining()+' neue Erstellungen heute übrig</p></div>',
    true,'today',true
  );
  const input=document.getElementById('photoInput');
  if(input)input.onchange=function(e){const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>8*1024*1024){renderError('Das Bild ist größer als 8 MB.',true);return}state.file=f;if(state.preview)URL.revokeObjectURL(state.preview);state.preview=URL.createObjectURL(f);renderCreate(false)};
}
function renderLoading(){
  app.innerHTML=shell('<section class="v4-loading"><div>'+v4Mark()+'</div><span class="v4-loader"></span><h2>Runde wird vorbereitet</h2><p>Inhalt lesen · Fragen mischen · Antworten prüfen</p></section>',false,'today',true);
}
function renderError(message,localOnly){
  const canText=String(state.textDraft||'').trim().length>=20;
  app.innerHTML=shell('<section class="v4-page-title"><span class="v4-error-icon">'+v4Icon('alert',23)+'</span><h1>Das hat nicht geklappt</h1><p>'+(localOnly?esc(message):'Die automatische Erstellung ist gerade nicht erreichbar. Dein Text bleibt erhalten.')+'</p></section>'+
    '<div class="v4-error-card"><strong>Du kannst trotzdem weiterlernen.</strong><p>'+(canText?'Aus deinem Text kann SnapStudy direkt eine einfache Lücken-Runde bauen.':'Füge Text ein oder probiere die Erstellung später erneut.')+'</p></div>'+
    '<div class="v4-buttons"><button class="v4-btn primary full" data-action="retry-analyze">Erneut versuchen</button>'+(canText?'<button class="v4-btn secondary full" data-action="local-text">Aus Text ohne Cloud erstellen</button>':'<button class="v4-btn secondary full" data-action="continue-text">Text einfügen</button>')+'</div>',
    true,'today',true
  );
}
async function analyze(){
  const el=document.getElementById('studyText');if(el)state.textDraft=el.value.trim();
  if(!state.file&&String(state.textDraft||'').length<8){renderCreate(true);return}
  renderLoading();
  try{
    let r;
    if(state.file){const f=new FormData();f.append('image',state.file,state.file.name||'scan.jpg');f.append('text',state.textDraft||'');r=await fetch('/api/analyze',{method:'POST',body:f})}
    else r=await fetch('/api/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:state.textDraft})});
    const payload=await r.json().catch(function(){return{}});
    if(!r.ok)throw new Error(payload.error||'Erstellung nicht verfügbar.');
    const c=challengeFromAnalysis(payload);if(!c.questions||c.questions.length<3)throw new Error('Die Fragen waren unvollständig.');
    consume();v4SaveRound(c);startChallenge(c,'normal');
  }catch(err){
    if(!state.file&&String(state.textDraft||'').length>=20){const local=v4LocalTextChallenge(state.textDraft);consume();v4SaveRound(local);startChallenge(local,'normal');return}
    renderError(err&&err.message?err.message:'Erstellung nicht verfügbar.');
  }
}
function startChallenge(c,mode){
  state.challenge=c;state.mode=mode||'normal';state.qIndex=0;state.score=0;state.answered=false;state.lastCorrect=false;state.lastExplanation='';state.uncertainMarked=false;renderQuestion();
}
function renderQuestion(){
  const c=state.challenge,q=c.questions[state.qIndex],total=c.questions.length,pct=((state.qIndex+(state.answered?1:0))/total)*100;
  let input='';
  if(q.choices&&q.choices.length)input='<div class="v4-answers">'+q.choices.map(function(x,i){return'<button class="v4-answer" data-action="choice" data-value="'+esc(x)+'"><span>'+String.fromCharCode(65+i)+'</span><b>'+esc(x)+'</b></button>'}).join('')+'</div>';
  else input='<div class="v4-free"><input id="answerInput" placeholder="Deine Antwort"><button class="v4-btn primary" data-action="submit-answer">Prüfen</button></div>';
  let after='';
  if(state.answered)after='<div class="v4-feedback '+(state.lastCorrect?'good':'bad')+'"><div>'+v4Icon(state.lastCorrect?'check':'alert',19)+'<strong>'+(state.lastCorrect?'Richtig':'Noch nicht')+'</strong></div><p>'+esc(state.lastExplanation||'')+'</p></div>'+
    (state.lastCorrect&&state.mode==='normal'?'<button class="v4-uncertain '+(state.uncertainMarked?'marked':'')+'" data-action="mark-uncertain">'+v4Icon('repeat',16)+(state.uncertainMarked?'Für später eingeplant':'War unsicher – später nochmal')+'</button>':'')+
    '<button class="v4-btn primary full" data-action="next">'+(state.qIndex===total-1?'Ergebnis ansehen':'Weiter')+v4Icon('arrow',17)+'</button>';
  app.innerHTML=shell('<div class="v4-lesson-top"><button class="v4-icon-btn quiet" data-action="home">'+v4Icon('back',20)+'</button><div class="v4-progress"><i style="width:'+pct+'%"></i></div><span>'+(state.qIndex+1)+'/'+total+'</span></div>'+
    '<section class="v4-question"><div><span>'+esc(c.topic||'Lernen')+'</span><span>'+(state.mode==='review'?'Fehlertraining':'Aus deinem Stoff')+'</span></div><h1>'+esc(q.prompt)+'</h1></section>'+
    (state.answered?'':input)+after,false,'today',true);
}
function answer(value){
  if(state.answered)return;const q=state.challenge.questions[state.qIndex],ok=correct(q,value);
  state.lastCorrect=ok;state.lastExplanation=q.explanation||(ok?'Das passt.':'Schau dir den Zusammenhang noch einmal an.');state.answered=true;state.uncertainMarked=false;if(ok)state.score++;
  if(state.mode==='review')v4ResolveReview(q,state.challenge,ok);else if(!ok)v4PlanReview(q,state.challenge,'wrong');
  if(navigator.vibrate)navigator.vibrate(ok?15:[15,35,15]);renderQuestion();
}
function next(){
  if(state.qIndex>=state.challenge.questions.length-1){renderResult();return}
  state.qIndex++;state.answered=false;state.lastCorrect=false;state.lastExplanation='';state.uncertainMarked=false;renderQuestion();
}
function renderResult(){
  const total=state.challenge.questions.length,pct=Math.round(state.score/total*100),p=profile(),today=new Date().toISOString().slice(0,10),y=new Date(Date.now()-86400000).toISOString().slice(0,10);
  if(p.last!==today){p.streak=p.last===y?(p.streak||0)+1:1;p.last=today}p.xp=(p.xp||0)+Math.max(10,pct);p.sessions=(p.sessions||0)+1;localStorage.setItem('snapstudy-profile',JSON.stringify(p));
  if(state.mode!=='review')v4SaveRound(state.challenge);
  const due=v4Due().length;
  app.innerHTML=shell('<section class="v4-result"><span>'+v4Icon(pct>=80?'trophy':'check',30)+'</span><span class="v4-kicker">'+(state.mode==='review'?'Fehlertraining beendet':'Runde beendet')+'</span><h1>'+(pct>=80?'Sitzt ziemlich gut.':pct>=60?'Gute Basis.':'Noch nicht fest genug.')+'</h1><p>'+state.score+' von '+total+' richtig</p></section>'+
    '<div class="v4-scoreline"><strong>'+pct+'%</strong><div><span>Aktuell fällig</span><b>'+due+' Frage'+(due===1?'':'n')+'</b></div></div>'+
    '<div class="v4-result-note"><strong>Kein Fehler geht verloren.</strong><p>Falsche und als unsicher markierte Antworten erscheinen automatisch wieder im Fehlertraining.</p></div>'+
    '<div class="v4-buttons"><button class="v4-btn primary full" data-action="duel">'+v4Icon('share',17)+'Als Duell teilen</button><button class="v4-btn secondary full" data-action="today">Zurück zu Heute</button></div>',
    false,'today',true
  );
}
function v4ReviewRow(x){
  const due=(x.dueAt||0)<=Date.now(),diff=Math.max(0,(x.dueAt||0)-Date.now()),hours=Math.round(diff/3600000),when=due?'jetzt':(hours<24?'in '+Math.max(1,hours)+' Std.':'in '+Math.round(hours/24)+' Tagen');
  return'<article class="v4-review-row"><i class="'+(due?'due':'')+'"></i><div><strong>'+esc(x.prompt)+'</strong><span>'+esc(x.sourceTitle||x.topic||'Lernrunde')+' · '+when+'</span></div></article>';
}
function renderReviewsV4(){
  const all=v4Reviews().slice().sort(function(a,b){return(a.dueAt||0)-(b.dueAt||0)}),due=all.filter(function(x){return(x.dueAt||0)<=Date.now()}),later=all.filter(function(x){return(x.dueAt||0)>Date.now()});
  let body='';
  if(!all.length)body='<div class="v4-empty"><span>'+v4Icon('repeat',27)+'</span><h2>Noch nichts offen</h2><p>Falsche oder unsichere Antworten landen automatisch hier. Du musst keine Lernkarten selbst anlegen.</p><button class="v4-btn primary" data-action="create">Neue Runde</button></div>';
  else body=(due.length?'<section class="v4-section"><div class="v4-section-head"><h2>Jetzt fällig</h2><span>'+due.length+'</span></div><div class="v4-review-list">'+due.slice(0,8).map(v4ReviewRow).join('')+'</div><button class="v4-btn primary full v4-section-action" data-action="start-due">'+v4Icon('play',17)+'Fehlertraining starten</button></section>':'')+
    (later.length?'<section class="v4-section"><div class="v4-section-head"><h2>Später</h2><span>'+later.length+'</span></div><div class="v4-review-list muted">'+later.slice(0,6).map(v4ReviewRow).join('')+'</div></section>':'');
  app.innerHTML=shell('<section class="v4-page-title"><span class="v4-kicker">Fehler</span><h1>Nur das wiederholen, was noch wackelt.</h1><p>Falsch beantwortet oder selbst als unsicher markiert – sonst nichts.</p></section>'+body,false,'reviews',false);
}
function v4StartDue(){
  const due=v4Due().slice(0,5);if(!due.length){renderReviewsV4();return}
  startChallenge({title:'Fehlertraining',topic:'Wiederholung',questions:due.map(function(x){return{prompt:x.prompt,choices:x.choices,accepted:x.accepted,explanation:x.explanation}})},'review');
}
function renderLibraryV4(){
  const list=v4Library();
  const body=list.length?'<div class="v4-library">'+list.map(function(x){return'<article><div><span class="v4-small-icon">'+v4Icon('stack',20)+'</span><div><strong>'+esc(x.title)+'</strong><span>'+esc(x.topic)+' · '+x.questions.length+' Fragen</span></div></div><footer><button data-action="play-library" data-id="'+esc(x.id)+'">'+v4Icon('play',16)+'Spielen</button><button data-action="share-library" data-id="'+esc(x.id)+'">'+v4Icon('share',16)+'Duell</button></footer></article>'}).join('')+'</div>':
    '<div class="v4-empty"><span>'+v4Icon('stack',27)+'</span><h2>Noch keine Runden</h2><p>Jede erstellte Runde wird hier gespeichert, damit du sie später wiederholen oder teilen kannst.</p><button class="v4-btn primary" data-action="create">Erste Runde erstellen</button></div>';
  app.innerHTML=shell('<section class="v4-page-title"><span class="v4-kicker">Sammlung</span><h1>Dein eigener Lernstoff.</h1><p>Keine öffentlichen Sets, keine Suche. Nur das, was du selbst lernen musst.</p></section>'+body,false,'library',false);
}
function renderDuel(){
  const list=v4Library(),current=state.challenge&&state.challenge.questions?state.challenge:list[0];
  app.innerHTML=shell('<section class="v4-page-title"><span class="v4-kicker">Duelle</span><h1>Gleicher Stoff. Gleiche Fragen.</h1><p>Ein Freund bekommt exakt dieselbe Runde. So vergleicht ihr denselben Lernstoff.</p></section>'+
    (current?'<div class="v4-duel"><span>'+v4Icon('duel',27)+'</span><div><small>Bereit zum Teilen</small><strong>'+esc(current.title)+'</strong><p>'+current.questions.length+' Fragen · kein Konto nötig</p></div><button class="v4-btn primary full" data-action="share-current">'+v4Icon('share',17)+'Duell-Link teilen</button></div>':
    '<div class="v4-empty"><span>'+v4Icon('duel',27)+'</span><h2>Erst eine Runde erstellen</h2><p>Danach kannst du genau diese Fragen als Duell teilen.</p><button class="v4-btn primary" data-action="create">Neue Runde</button></div>'),
    false,'duel',false
  );
}
function v4PlayLibrary(id){const x=v4Library().find(function(r){return r.id===id});if(x)startChallenge(x,'normal')}
async function v4ShareChallenge(c){
  if(!c)return;const compact={title:c.title,topic:c.topic,source:c.source||'',questions:c.questions},url=location.origin+location.pathname+'#challenge='+encodeURIComponent(encodeChallenge(compact));
  try{if(navigator.share)await navigator.share({title:'SnapStudy Duell',text:'Gleicher Stoff, gleiche Fragen. Wie viele schaffst du?',url:url});else{await navigator.clipboard.writeText(url);v4Toast('Duell-Link kopiert')}}catch(_){}
}
function v4Toast(t){const old=document.querySelector('.v4-toast');if(old)old.remove();const el=document.createElement('div');el.className='v4-toast';el.textContent=t;document.body.appendChild(el);setTimeout(function(){el.classList.add('show')},10);setTimeout(function(){el.remove()},1900)}
function handleHash(){
  if(!location.hash.startsWith('#challenge='))return false;
  try{const c=decodeChallenge(decodeURIComponent(location.hash.slice('#challenge='.length)));state.invite=c;app.innerHTML=shell('<section class="v4-invite"><div>'+v4Mark()+'</div><span class="v4-kicker">Duell erhalten</span><h1>'+esc(c.title)+'</h1><p>'+esc(c.topic||'Lernrunde')+' · '+c.questions.length+' identische Fragen</p><div>'+v4Icon('check',17)+'<p>Beide spielen exakt dieselbe Runde. Dein Ergebnis bleibt auf deinem Gerät.</p></div><button class="v4-btn primary full" data-action="start-invite">'+v4Icon('play',17)+'Duell starten</button></section>',false,'today',true);return true}catch(_){history.replaceState(null,'',location.pathname);return false}
}
app.onclick=function(e){
  const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  if(a==='home'||a==='today')renderHome();
  if(a==='create'){state.file=null;state.preview='';renderCreate(false)}
  if(a==='create-text'){state.file=null;state.preview='';renderCreate(true)}
  if(a==='analyze'||a==='retry-analyze')analyze();
  if(a==='continue-text'){state.file=null;state.preview='';renderCreate(true)}
  if(a==='local-text'){const c=v4LocalTextChallenge(state.textDraft);consume();v4SaveRound(c);startChallenge(c,'normal')}
  if(a==='choice')answer(b.dataset.value||'');
  if(a==='submit-answer'){const i=document.getElementById('answerInput');if(i&&i.value.trim())answer(i.value)}
  if(a==='mark-uncertain'){if(state.answered&&state.lastCorrect&&!state.uncertainMarked){v4PlanReview(state.challenge.questions[state.qIndex],state.challenge,'uncertain');state.uncertainMarked=true;renderQuestion()}}
  if(a==='next')next();
  if(a==='reviews')renderReviewsV4();
  if(a==='start-due')v4StartDue();
  if(a==='library')renderLibraryV4();
  if(a==='play-library')v4PlayLibrary(b.dataset.id);
  if(a==='share-library'){const x=v4Library().find(function(r){return r.id===b.dataset.id});if(x)v4ShareChallenge(x)}
  if(a==='duel')renderDuel();
  if(a==='share-current')v4ShareChallenge(state.challenge&&state.challenge.questions?state.challenge:v4Library()[0]);
  if(a==='start-invite')startChallenge(state.invite,'invite');
};


/* SnapStudy Notes V1 */
function nav(active){
  const items=[['today','Heute','today'],['notes','Notizen','text'],['reviews','Fehler','repeat'],['library','Sammlung','stack']];
  return '<nav class="v4-nav">'+items.map(function(x){return'<button data-action="'+x[0]+'" class="'+(active===x[0]?'active':'')+'">'+v4Icon(x[2],21)+'<span>'+x[1]+'</span></button>'}).join('')+'</nav>';
}

function notesStore(){
  return v4Load('snapstudy-notes-v1',[
    {id:'n1',title:'Gravitation',text:'Gravitationskraft: F = G · m₁m₂ / r². Wenn sich der Abstand verdoppelt, wird die Kraft viermal kleiner.',paper:'ruled',updatedAt:Date.now()},
    {id:'n2',title:'Kepler III',text:'Drittes Keplersches Gesetz: T² / a³ ist für Bahnen um denselben Zentralkörper konstant.',paper:'ruled',updatedAt:Date.now()}
  ]);
}
function saveNotesStore(list){v4Save('snapstudy-notes-v1',list)}
function noteStrokes(id){return v4Load('snapstudy-note-strokes-'+id,[])}
function saveNoteStrokes(id,s){v4Save('snapstudy-note-strokes-'+id,s)}
if(!state.noteId) state.noteId='n1';
if(!state.noteTool) state.noteTool='pen';
if(!state.noteColor) state.noteColor='#1C2433';
if(!state.noteWidth) state.noteWidth=3;
if(!state.noteSelection) state.noteSelection=null;

function renderNotes(){
  const list=notesStore();
  let note=list.find(function(n){return n.id===state.noteId})||list[0];
  if(!note){note={id:'n'+Date.now().toString(36),title:'Neue Seite',text:'',paper:'ruled',updatedAt:Date.now()};list.push(note);saveNotesStore(list);state.noteId=note.id}
  const pages=list.map(function(n){
    return '<button class="notes-page '+(n.id===note.id?'active':'')+'" data-action="open-note" data-id="'+esc(n.id)+'"><span class="notes-thumb"></span><span><b>'+esc(n.title)+'</b><small>'+esc((n.text||'').slice(0,45)||'Leere Seite')+'</small></span></button>'
  }).join('');
  app.innerHTML=shell(
    '<section class="notes-shell">'+
      '<div class="notes-top"><div><span class="v4-kicker">Notizen</span><h1>'+esc(note.title)+'</h1></div><button class="v4-btn primary notes-study" data-action="note-study">'+v4Icon('play',17)+'Als Lernrunde nutzen</button></div>'+
      '<div class="notes-workspace">'+
        '<aside class="notes-sidebar"><div class="notes-side-head"><strong>Seiten</strong><button data-action="add-note">'+v4Icon('plus',17)+'</button></div>'+pages+'</aside>'+
        '<main class="notes-editor">'+
          '<div class="notes-toolbar">'+
            '<button data-action="note-tool" data-tool="pen" class="'+(state.noteTool==='pen'?'active':'')+'">'+v4Icon('text',18)+'<span>Stift</span></button>'+
            '<button data-action="note-tool" data-tool="marker" class="'+(state.noteTool==='marker'?'active':'')+'">'+v4Icon('spark',18)+'<span>Marker</span></button>'+
            '<button data-action="note-tool" data-tool="eraser" class="'+(state.noteTool==='eraser'?'active':'')+'">'+v4Icon('alert',18)+'<span>Radierer</span></button>'+
            '<button data-action="note-tool" data-tool="select" class="'+(state.noteTool==='select'?'active':'')+'">'+v4Icon('stack',18)+'<span>Auswahl</span></button>'+
            '<span class="notes-sep"></span>'+
            '<button class="color-dot dark" data-action="note-color" data-color="#1C2433" aria-label="Dunkel"></button>'+
            '<button class="color-dot violet" data-action="note-color" data-color="#6558D8" aria-label="Violett"></button>'+
            '<button class="color-dot red" data-action="note-color" data-color="#B8574E" aria-label="Rot"></button>'+
            '<button class="notes-undo" data-action="note-undo" title="Rückgängig">'+v4Icon('back',18)+'</button>'+
          '</div>'+
          '<div class="note-page-wrap">'+
            '<div class="note-page '+esc(note.paper||'ruled')+'">'+
              '<textarea id="noteText" class="note-text" placeholder="Tippe hier oder schreibe mit dem Stift...">'+esc(note.text||'')+'</textarea>'+
              '<canvas id="noteCanvas" width="1000" height="1400"></canvas>'+
              (state.noteTool==='select'?'<div class="note-select-hint">Ziehe einen Bereich auf und nutze ihn direkt zum Lernen.</div>':'')+
            '</div>'+
          '</div>'+
          '<div class="notes-actions"><button class="v4-btn secondary" data-action="mark-note-review">'+v4Icon('repeat',17)+'Für später markieren</button><button class="v4-btn primary" data-action="note-study">'+v4Icon('play',17)+'Als Lernrunde nutzen</button></div>'+
        '</main>'+
      '</div>'+
    '</section>',
    false,'notes',false
  );
  bindNotesCanvas(note);
  const ta=document.getElementById('noteText');
  if(ta)ta.addEventListener('input',function(){
    const next=notesStore();const i=next.findIndex(function(n){return n.id===note.id});if(i>=0){next[i].text=ta.value;next[i].updatedAt=Date.now();saveNotesStore(next)}
  });
}

function bindNotesCanvas(note){
  const c=document.getElementById('noteCanvas');if(!c)return;
  const ctx=c.getContext('2d');let strokes=noteStrokes(note.id);
  function redraw(){
    ctx.clearRect(0,0,c.width,c.height);
    strokes.forEach(function(s){
      if(!s.points||s.points.length<2)return;
      ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);
      for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);
      ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.tool==='marker'?0.28:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    });
    ctx.globalAlpha=1;
  }
  redraw();
  let drawing=false,current=null,start=null;
  function pos(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*c.width,y:(e.clientY-r.top)/r.height*c.height}}
  c.onpointerdown=function(e){
    c.setPointerCapture(e.pointerId);const p=pos(e);
    if(state.noteTool==='eraser'){
      strokes=strokes.filter(function(s){const q=s.points&&s.points[s.points.length-1];return !q||Math.hypot(q.x-p.x,q.y-p.y)>90});saveNoteStrokes(note.id,strokes);redraw();return;
    }
    if(state.noteTool==='select'){start=p;state.noteSelection={x:p.x,y:p.y,w:0,h:0};drawing=true;return}
    drawing=true;current={tool:state.noteTool,color:state.noteTool==='marker'?'#F2C14E':state.noteColor,width:state.noteTool==='marker'?28:state.noteWidth,points:[p]};strokes.push(current);
  };
  c.onpointermove=function(e){
    if(!drawing)return;const p=pos(e);
    if(state.noteTool==='select'&&start){state.noteSelection={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};redraw();const s=state.noteSelection;ctx.save();ctx.strokeStyle='#6558D8';ctx.setLineDash([14,10]);ctx.lineWidth=3;ctx.strokeRect(s.x,s.y,s.w,s.h);ctx.restore();return}
    if(current){current.points.push(p);redraw()}
  };
  c.onpointerup=function(){if(drawing){drawing=false;current=null;start=null;saveNoteStrokes(note.id,strokes)}};
  c.onpointercancel=c.onpointerup;
}

function addNote(){
  const list=notesStore(),n={id:'n'+Date.now().toString(36),title:'Neue Seite '+(list.length+1),text:'',paper:'ruled',updatedAt:Date.now()};list.push(n);saveNotesStore(list);state.noteId=n.id;renderNotes();
}
function noteStudy(){
  const note=notesStore().find(function(n){return n.id===state.noteId});if(!note)return;
  const text=String(note.text||'').trim();
  const canvas=document.getElementById('noteCanvas');
  if(canvas&&noteStrokes(note.id).length){
    canvas.toBlob(function(blob){
      if(blob){state.file=new File([blob],'notiz.png',{type:'image/png'});state.textDraft=text;analyze()}
      else if(text.length>=20){const ch=v4LocalTextChallenge(text);v4SaveRound(ch);startChallenge(ch,'normal')}
    },'image/png');
  }else if(text.length>=20){
    state.textDraft=text;analyze();
  }else{
    v4Toast('Füge erst etwas Inhalt hinzu');
  }
}
function markNoteReview(){
  const note=notesStore().find(function(n){return n.id===state.noteId});if(!note)return;
  const txt=String(note.text||'').trim();if(!txt){v4Toast('Noch kein Text zum Wiederholen');return}
  const q={prompt:'Erkläre diesen Abschnitt aus '+note.title+': '+txt.slice(0,110),choices:[],accepted:[txt.slice(0,80)],explanation:txt};
  v4PlanReview(q,{title:note.title,topic:'Notiz'},'uncertain');v4Toast('Für später eingeplant');
}
const previousClickHandler=app.onclick;
app.onclick=function(e){
  const b=e.target.closest('[data-action]');
  if(!b){if(previousClickHandler)previousClickHandler(e);return}
  const a=b.dataset.action;
  if(a==='notes'){renderNotes();return}
  if(a==='open-note'){state.noteId=b.dataset.id;renderNotes();return}
  if(a==='add-note'){addNote();return}
  if(a==='note-tool'){state.noteTool=b.dataset.tool||'pen';renderNotes();return}
  if(a==='note-color'){state.noteColor=b.dataset.color||'#1C2433';return}
  if(a==='note-undo'){const s=noteStrokes(state.noteId);s.pop();saveNoteStrokes(state.noteId,s);renderNotes();return}
  if(a==='note-study'){noteStudy();return}
  if(a==='mark-note-review'){markNoteReview();return}
  if(previousClickHandler)previousClickHandler(e);
};


/* SnapStudy Notes polish */
V4_ICONS.focus='<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>';
V4_ICONS.save='<path d="m5 12 4 4L19 6"/>';
V4_ICONS.paper='<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>';

if(!state.notesFocus) state.notesFocus=false;
if(!state.noteSaved) state.noteSaved=true;

function saveNotePatch(id, patch){
  const list=notesStore();
  const i=list.findIndex(function(n){return n.id===id});
  if(i<0)return;
  list[i]=Object.assign({},list[i],patch,{updatedAt:Date.now()});
  saveNotesStore(list);
  state.noteSaved=true;
}
function renderNotes(){
  const list=notesStore();
  let note=list.find(function(n){return n.id===state.noteId})||list[0];
  if(!note){note={id:'n'+Date.now().toString(36),title:'Neue Seite',text:'',paper:'ruled',updatedAt:Date.now()};list.push(note);saveNotesStore(list);state.noteId=note.id}
  const pages=list.map(function(n){
    return '<button class="notes-page '+(n.id===note.id?'active':'')+'" data-action="open-note" data-id="'+esc(n.id)+'"><span class="notes-thumb '+esc(n.paper||'ruled')+'"></span><span><b>'+esc(n.title)+'</b><small>'+esc((n.text||'').slice(0,45)||'Leere Seite')+'</small></span></button>'
  }).join('');
  const focus=!!state.notesFocus;
  app.innerHTML=shell(
    '<section class="notes-shell '+(focus?'is-focus':'')+'">'+
      (focus?'<button class="notes-exit-focus" data-action="notes-focus">'+v4Icon('focus',18)+'</button>':'')+
      (!focus?'<div class="notes-top"><div><span class="v4-kicker">Notizen</span><div class="notes-title-row"><input id="noteTitle" class="notes-title-input" value="'+esc(note.title)+'" aria-label="Seitentitel"><span class="notes-saved">'+v4Icon('save',13)+(state.noteSaved?'Gespeichert':'Speichert…')+'</span></div></div><div class="notes-top-actions"><select id="paperSelect" class="notes-paper-select" aria-label="Papierart"><option value="ruled" '+((note.paper||'ruled')==='ruled'?'selected':'')+'>Liniert</option><option value="grid" '+(note.paper==='grid'?'selected':'')+'>Kariert</option><option value="plain" '+(note.paper==='plain'?'selected':'')+'>Blanko</option></select><button class="notes-focus-btn" data-action="notes-focus" aria-label="Fokusmodus">'+v4Icon('focus',18)+'</button><button class="v4-btn primary notes-study" data-action="note-study">'+v4Icon('play',17)+'Als Lernrunde nutzen</button></div></div>':'')+
      '<div class="notes-workspace">'+
        (!focus?'<aside class="notes-sidebar"><div class="notes-side-head"><strong>Seiten</strong><button data-action="add-note" aria-label="Neue Seite">'+v4Icon('plus',17)+'</button></div>'+pages+'</aside>':'')+
        '<main class="notes-editor">'+
          (!focus?'<div class="notes-toolbar">'+
            '<button data-action="note-tool" data-tool="pen" class="'+(state.noteTool==='pen'?'active':'')+'">'+v4Icon('text',18)+'<span>Stift</span></button>'+
            '<button data-action="note-tool" data-tool="marker" class="'+(state.noteTool==='marker'?'active':'')+'">'+v4Icon('spark',18)+'<span>Marker</span></button>'+
            '<button data-action="note-tool" data-tool="eraser" class="'+(state.noteTool==='eraser'?'active':'')+'">'+v4Icon('alert',18)+'<span>Radierer</span></button>'+
            '<button data-action="note-tool" data-tool="select" class="'+(state.noteTool==='select'?'active':'')+'">'+v4Icon('stack',18)+'<span>Auswahl</span></button>'+
            '<button data-action="note-tool" data-tool="text" class="'+(state.noteTool==='text'?'active':'')+'">'+v4Icon('text',18)+'<span>Text</span></button>'+
            '<span class="notes-sep"></span>'+
            '<button class="color-dot dark" data-action="note-color" data-color="#1C2433" aria-label="Dunkel"></button>'+
            '<button class="color-dot violet" data-action="note-color" data-color="#6558D8" aria-label="Violett"></button>'+
            '<button class="color-dot red" data-action="note-color" data-color="#B8574E" aria-label="Rot"></button>'+
            '<button class="notes-undo" data-action="note-undo" title="Rückgängig">'+v4Icon('back',18)+'</button>'+
          '</div>':'')+
          '<div class="note-page-wrap">'+
            '<div class="note-page '+esc(note.paper||'ruled')+'">'+
              '<textarea id="noteText" class="note-text '+(state.noteTool==='text'?'editing':'')+'" placeholder="Tippe hier oder schreibe mit dem Stift...">'+esc(note.text||'')+'</textarea>'+
              '<canvas id="noteCanvas" class="'+(state.noteTool==='text'?'text-mode':'')+'" width="1000" height="1400"></canvas>'+
              (state.noteTool==='select'?'<div class="note-select-hint">Bereich markieren → nur diesen Teil lernen</div>':'')+
            '</div>'+
          '</div>'+
          (!focus?'<div class="notes-actions"><button class="v4-btn secondary" data-action="mark-note-review">'+v4Icon('repeat',17)+'Für später markieren</button><button class="v4-btn primary" data-action="note-study">'+v4Icon('play',17)+(state.noteSelection&&state.noteSelection.w>40?'Aus Auswahl lernen':'Als Lernrunde nutzen')+'</button></div>':'')+
        '</main>'+
      '</div>'+
    '</section>',
    false,'notes',focus
  );
  bindNotesCanvas(note);
  const ta=document.getElementById('noteText');
  if(ta)ta.addEventListener('input',function(){state.noteSaved=false;saveNotePatch(note.id,{text:ta.value})});
  const title=document.getElementById('noteTitle');
  if(title)title.addEventListener('input',function(){state.noteSaved=false;saveNotePatch(note.id,{title:title.value||'Unbenannte Seite'})});
  const paper=document.getElementById('paperSelect');
  if(paper)paper.addEventListener('change',function(){saveNotePatch(note.id,{paper:paper.value});renderNotes()});
  if(!state.noteKeyBound){
    state.noteKeyBound=true;
    window.addEventListener('keydown',function(e){
      if(!document.querySelector('.notes-shell'))return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();const s=noteStrokes(state.noteId);s.pop();saveNoteStrokes(state.noteId,s);renderNotes();return}
      if(e.target&&['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
      if(e.key.toLowerCase()==='p'){state.noteTool='pen';renderNotes()}
      if(e.key.toLowerCase()==='e'){state.noteTool='eraser';renderNotes()}
      if(e.key.toLowerCase()==='f'){state.notesFocus=!state.notesFocus;renderNotes()}
    });
  }
}
function cropNoteCanvas(canvas, sel){
  if(!sel||sel.w<20||sel.h<20)return canvas;
  const out=document.createElement('canvas');
  out.width=Math.max(1,Math.round(sel.w));out.height=Math.max(1,Math.round(sel.h));
  const ctx=out.getContext('2d');if(ctx)ctx.drawImage(canvas,sel.x,sel.y,sel.w,sel.h,0,0,out.width,out.height);
  return out;
}
function noteStudy(){
  const note=notesStore().find(function(n){return n.id===state.noteId});if(!note)return;
  const text=String(note.text||'').trim();
  if(text.length>=20){
    state.file=null;state.textDraft=text;analyze();return;
  }
  const canvas=document.getElementById('noteCanvas');
  if(canvas&&noteStrokes(note.id).length){
    const source=cropNoteCanvas(canvas,state.noteSelection);
    source.toBlob(function(blob){
      if(!blob){v4Toast('Notiz konnte nicht gelesen werden');return}
      state.file=new File([blob],'notiz.png',{type:'image/png'});
      state.textDraft='Notiz: '+note.title;
      analyze();
    },'image/png');
    return;
  }
  v4Toast('Füge erst Text oder Handschrift hinzu');
}
const notesPolishPrevious=app.onclick;
app.onclick=function(e){
  const b=e.target.closest('[data-action]');
  if(!b){if(notesPolishPrevious)notesPolishPrevious(e);return}
  const a=b.dataset.action;
  if(a==='notes'){renderNotes();return}
  if(a==='notes-focus'){state.notesFocus=!state.notesFocus;renderNotes();return}
  if(a==='note-study'){noteStudy();return}
  if(notesPolishPrevious)notesPolishPrevious(e);
};

// Initialize only after all V4/Notes declarations are ready.
if(!handleHash())renderHome();


/* SnapStudy Notes V2 — reliable Goodnotes-style editor core */
V4_ICONS.search='<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>';
V4_ICONS.trash='<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/>';
V4_ICONS.copy='<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>';
V4_ICONS.download='<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>';
V4_ICONS.zoom='<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/><path d="M10 7v6M7 10h6"/>';
V4_ICONS.shape='<rect x="4" y="4" width="7" height="7" rx="1"/><circle cx="16.5" cy="16.5" r="3.5"/>';
V4_ICONS.more='<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>';
V4_ICONS.up='<path d="m6 14 6-6 6 6"/>';
V4_ICONS.down='<path d="m6 10 6 6 6-6"/>';

if(!state.gnTool) state.gnTool='pen';
if(!state.gnColor) state.gnColor='#1C2433';
if(!state.gnPenSize) state.gnPenSize=6;
if(!state.gnMarkerSize) state.gnMarkerSize=28;
if(!state.gnEraserSize) state.gnEraserSize=55;
if(!state.gnZoom) state.gnZoom=100;
if(!state.gnSelection) state.gnSelection=null;
if(!state.gnSearchOpen) state.gnSearchOpen=false;
if(!state.gnSearchQuery) state.gnSearchQuery='';
if(!state.gnPageMenu) state.gnPageMenu=false;
if(!state.gnHistory) state.gnHistory={};
if(!state.gnRedo) state.gnRedo={};

function gnIcon(name,size){return v4Icon(name,size)}
function gnCurrentNote(){const list=notesStore();return list.find(function(n){return n.id===state.noteId})||list[0]}
function gnSaveNote(id,patch){
  const list=notesStore(),i=list.findIndex(function(n){return n.id===id});
  if(i<0)return;
  list[i]=Object.assign({},list[i],patch,{updatedAt:Date.now()});
  saveNotesStore(list);
}
function gnSnapshot(id){
  const stack=state.gnHistory[id]||(state.gnHistory[id]=[]);
  stack.push(JSON.stringify(noteStrokes(id)));
  if(stack.length>40)stack.shift();
  state.gnRedo[id]=[];
}
function gnUndo(){
  const id=state.noteId,stack=state.gnHistory[id]||[];
  if(!stack.length){const s=noteStrokes(id);if(s.length){state.gnRedo[id]=[JSON.stringify(s)].concat(state.gnRedo[id]||[]);s.pop();saveNoteStrokes(id,s);renderNotes()}return}
  const current=JSON.stringify(noteStrokes(id));
  const prev=stack.pop();
  state.gnRedo[id]=(state.gnRedo[id]||[]).concat([current]);
  saveNoteStrokes(id,JSON.parse(prev));
  renderNotes();
}
function gnRedo(){
  const id=state.noteId,redo=state.gnRedo[id]||[];
  if(!redo.length)return;
  const current=JSON.stringify(noteStrokes(id));
  const next=redo.pop();
  (state.gnHistory[id]||(state.gnHistory[id]=[])).push(current);
  saveNoteStrokes(id,JSON.parse(next));
  renderNotes();
}
function gnStrokeBounds(stroke){
  const pts=stroke.points||[];
  if(!pts.length)return{x:0,y:0,w:0,h:0};
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  pts.forEach(function(p){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)});
  return{x:minX,y:minY,w:maxX-minX,h:maxY-minY};
}
function gnPointSegDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;
  if(!l2)return Math.hypot(p.x-a.x,p.y-a.y);
  let t=((p.x-a.x)*dx+(p.y-a.y)*dy)/l2;t=Math.max(0,Math.min(1,t));
  return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
}
function gnStrokeHit(stroke,p,r){
  const pts=stroke.points||[];
  if(pts.length===1)return Math.hypot(pts[0].x-p.x,pts[0].y-p.y)<=r;
  for(let i=1;i<pts.length;i++)if(gnPointSegDistance(p,pts[i-1],pts[i])<=r)return true;
  return false;
}
function gnSelectionBounds(strokes,ids){
  const chosen=strokes.filter(function(s){return ids.includes(s.id)});
  if(!chosen.length)return null;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  chosen.forEach(function(s){const b=gnStrokeBounds(s);minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);maxX=Math.max(maxX,b.x+b.w);maxY=Math.max(maxY,b.y+b.h)});
  return{x:minX,y:minY,w:maxX-minX,h:maxY-minY,ids:ids};
}
function gnIntersects(rect,b){
  return !(b.x>b.x+b.w || rect.x+rect.w<b.x || rect.y>b.y+b.h || rect.y+rect.h<b.y);
}
function gnInsideSelection(p,sel){return sel&&p.x>=sel.x&&p.x<=sel.x+sel.w&&p.y>=sel.y&&p.y<=sel.y+sel.h}
function gnDeleteSelection(){
  const sel=state.gnSelection;if(!sel)return;
  gnSnapshot(state.noteId);
  saveNoteStrokes(state.noteId,noteStrokes(state.noteId).filter(function(s){return!sel.ids.includes(s.id)}));
  state.gnSelection=null;renderNotes();
}
function gnCopySelection(){
  const sel=state.gnSelection;if(!sel)return;
  gnSnapshot(state.noteId);
  const strokes=noteStrokes(state.noteId),maxId=strokes.reduce(function(m,s){return Math.max(m,s.id||0)},0);
  let next=maxId+1;
  const copies=strokes.filter(function(s){return sel.ids.includes(s.id)}).map(function(s){return Object.assign({},s,{id:next++,points:(s.points||[]).map(function(p){return{x:p.x+45,y:p.y+45}})})});
  saveNoteStrokes(state.noteId,strokes.concat(copies));
  state.gnSelection=gnSelectionBounds(strokes.concat(copies),copies.map(function(s){return s.id}));
  renderNotes();
}
function gnColorSelection(color){
  const sel=state.gnSelection;if(!sel)return;
  gnSnapshot(state.noteId);
  const strokes=noteStrokes(state.noteId).map(function(s){return sel.ids.includes(s.id)?Object.assign({},s,{color:color}):s});
  saveNoteStrokes(state.noteId,strokes);renderNotes();
}
function gnDuplicatePage(){
  const list=notesStore(),note=gnCurrentNote();if(!note)return;
  const id='n'+Date.now().toString(36),copy=Object.assign({},note,{id:id,title:(note.title||'Seite')+' Kopie',updatedAt:Date.now()});
  list.splice(list.findIndex(function(n){return n.id===note.id})+1,0,copy);saveNotesStore(list);
  saveNoteStrokes(id,JSON.parse(JSON.stringify(noteStrokes(note.id))));
  state.noteId=id;state.gnPageMenu=false;state.gnSelection=null;renderNotes();
}
function gnDeletePage(){
  const list=notesStore();if(list.length<=1){v4Toast('Mindestens eine Seite muss bleiben');return}
  const i=list.findIndex(function(n){return n.id===state.noteId});if(i<0)return;
  list.splice(i,1);saveNotesStore(list);localStorage.removeItem('snapstudy-note-strokes-'+state.noteId);
  state.noteId=list[Math.max(0,i-1)].id;state.gnPageMenu=false;state.gnSelection=null;renderNotes();
}
function gnMovePage(dir){
  const list=notesStore(),i=list.findIndex(function(n){return n.id===state.noteId}),j=i+dir;
  if(i<0||j<0||j>=list.length)return;
  const tmp=list[i];list[i]=list[j];list[j]=tmp;saveNotesStore(list);renderNotes();
}
function gnExportPNG(){
  const note=gnCurrentNote();if(!note)return;
  const out=document.createElement('canvas');out.width=1000;out.height=1400;const ctx=out.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#FFFDF8';ctx.fillRect(0,0,out.width,out.height);
  ctx.strokeStyle='#ECE6DC';ctx.lineWidth=1;
  if((note.paper||'ruled')==='ruled'){for(let y=80;y<1400;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1000,y);ctx.stroke()}}
  if(note.paper==='grid'){for(let y=0;y<1400;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1000,y);ctx.stroke()}for(let x=0;x<1000;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1400);ctx.stroke()}}
  ctx.fillStyle='#273044';ctx.font='30px Georgia';ctx.textBaseline='top';
  String(note.text||'').split('\n').forEach(function(line,i){ctx.fillText(line,70,80+i*45,850)});
  noteStrokes(note.id).forEach(function(s){
    const pts=s.points||[];if(pts.length<2)return;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
    ctx.strokeStyle=s.color||'#1C2433';ctx.lineWidth=s.width||6;ctx.globalAlpha=s.tool==='marker'?.3:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=1;
  });
  const a=document.createElement('a');a.download=(note.title||'SnapStudy-Notiz').replace(/[^a-z0-9äöüß_-]+/gi,'-')+'.png';a.href=out.toDataURL('image/png');a.click();
}
function gnSearchResults(){
  const q=String(state.gnSearchQuery||'').trim().toLowerCase();if(!q)return[];
  return notesStore().filter(function(n){return String(n.title||'').toLowerCase().includes(q)||String(n.text||'').toLowerCase().includes(q)});
}
function gnToolOptions(){
  if(state.gnTool==='eraser')return '<div class="gn-tool-options"><span>Radierer</span><div class="gn-segment">'+[30,55,90].map(function(v){return'<button data-action="gn-eraser-size" data-size="'+v+'" class="'+(state.gnEraserSize===v?'active':'')+'">'+(v===30?'S':v===55?'M':'L')+'</button>'}).join('')+'</div><small>Berührt eine Linie irgendwo – nicht nur am Endpunkt.</small></div>';
  if(state.gnTool==='pen')return '<div class="gn-tool-options"><span>Stiftstärke</span><input data-action="gn-pen-size" id="gnPenSize" type="range" min="2" max="16" value="'+state.gnPenSize+'"><b>'+state.gnPenSize+'</b></div>';
  if(state.gnTool==='marker')return '<div class="gn-tool-options"><span>Marker</span><input id="gnMarkerSize" type="range" min="16" max="60" value="'+state.gnMarkerSize+'"><b>'+state.gnMarkerSize+'</b></div>';
  if(state.gnTool==='select')return '<div class="gn-tool-options"><span>Lasso</span><small>Rahmen ziehen. Danach Auswahl verschieben, kopieren, färben oder löschen.</small></div>';
  if(state.gnTool==='text')return '<div class="gn-tool-options"><span>Text</span><small>Tippe direkt auf der Seite.</small></div>';
  return '';
}
function renderNotes(){
  const list=notesStore();let note=gnCurrentNote();
  if(!note){addNote();return}
  const pages=list.map(function(n,i){
    return '<button class="gn-page-thumb '+(n.id===note.id?'active':'')+'" data-action="gn-open-page" data-id="'+esc(n.id)+'"><span class="gn-thumb-paper '+esc(n.paper||'ruled')+'"><i>'+String(i+1)+'</i></span><span><b>'+esc(n.title||'Unbenannt')+'</b><small>'+esc((n.text||'').replace(/\n/g,' ').slice(0,44)||'Leere Seite')+'</small></span></button>';
  }).join('');
  const sel=state.gnSelection;
  const searchResults=gnSearchResults();
  app.innerHTML=shell(
    '<section class="gn-shell">'+
      '<header class="gn-head"><button class="gn-back" data-action="today" aria-label="Zurück">'+gnIcon('back',20)+'</button><div class="gn-title"><input id="gnTitle" value="'+esc(note.title||'')+'" aria-label="Seitentitel"><span>'+gnIcon('save',12)+' lokal gespeichert</span></div><button class="gn-head-btn" data-action="gn-search">'+gnIcon('search',19)+'</button><button class="gn-head-btn" data-action="gn-page-menu">'+gnIcon('more',19)+'</button></header>'+
      '<div class="gn-body">'+
        '<aside class="gn-sidebar"><div class="gn-side-top"><strong>Seiten</strong><button data-action="gn-add-page">'+gnIcon('plus',17)+'</button></div><div class="gn-pages">'+pages+'</div></aside>'+
        '<main class="gn-editor">'+
          '<div class="gn-toolbar">'+
            [['pen','text','Stift'],['marker','spark','Marker'],['eraser','trash','Radierer'],['select','stack','Lasso'],['text','text','Text']].map(function(x){return'<button data-action="gn-tool" data-tool="'+x[0]+'" class="'+(state.gnTool===x[0]?'active':'')+'">'+gnIcon(x[1],19)+'<span>'+x[2]+'</span></button>'}).join('')+
            '<span class="gn-divider"></span>'+
            ['#1C2433','#6558D8','#B8574E','#2E7D5C','#E0A62E'].map(function(col){return'<button data-action="gn-color" data-color="'+col+'" class="gn-color '+(state.gnColor===col?'active':'')+'" style="--c:'+col+'" aria-label="Farbe"></button>'}).join('')+
            '<span class="gn-flex"></span>'+
            '<button data-action="gn-undo" class="gn-icon-only">'+gnIcon('undo',18)+'</button><button data-action="gn-redo" class="gn-icon-only">'+gnIcon('redo',18)+'</button>'+
          '</div>'+
          gnToolOptions()+
          '<div class="gn-page-stage"><div class="gn-page-scale" style="width:'+state.gnZoom+'%"><div class="gn-page '+esc(note.paper||'ruled')+'"><textarea id="gnText" class="'+(state.gnTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(note.text||'')+'</textarea><canvas id="gnCanvas" width="1000" height="1400"></canvas></div></div></div>'+
          '<footer class="gn-bottom">'+
            '<div class="gn-zoom">'+gnIcon('zoom',16)+'<input id="gnZoom" type="range" min="70" max="180" value="'+state.gnZoom+'"><span>'+state.gnZoom+'%</span></div>'+
            '<button data-action="gn-export">'+gnIcon('download',16)+' Export</button><button class="primary" data-action="note-study">'+gnIcon('play',16)+(sel&&sel.ids&&sel.ids.length?'Aus Auswahl lernen':'Lernrunde')+'</button>'+
          '</footer>'+
        '</main>'+
      '</div>'+
      (sel&&sel.ids&&sel.ids.length?'<div class="gn-selection-menu"><span>'+sel.ids.length+' Element'+(sel.ids.length===1?'':'e')+'</span><button data-action="gn-copy-selection">'+gnIcon('copy',17)+'</button><button data-action="gn-color-selection" data-color="#6558D8"><i class="gn-mini-color"></i></button><button data-action="gn-learn-selection">'+gnIcon('play',17)+'</button><button data-action="gn-delete-selection" class="danger">'+gnIcon('trash',17)+'</button></div>':'')+
      (state.gnPageMenu?'<div class="gn-popover"><button data-action="gn-duplicate-page">'+gnIcon('copy',17)+'Seite duplizieren</button><button data-action="gn-move-up">'+gnIcon('up',17)+'Nach oben</button><button data-action="gn-move-down">'+gnIcon('down',17)+'Nach unten</button><button data-action="gn-export">'+gnIcon('download',17)+'Als PNG exportieren</button><button data-action="gn-delete-page" class="danger">'+gnIcon('trash',17)+'Seite löschen</button></div>':'')+
      (state.gnSearchOpen?'<div class="gn-search-modal"><div class="gn-search-card"><header><strong>Notizen durchsuchen</strong><button data-action="gn-search-close">'+gnIcon('close',18)+'</button></header><input id="gnSearchInput" autofocus placeholder="Titel oder getippten Text suchen" value="'+esc(state.gnSearchQuery||'')+'"><div class="gn-search-results">'+(state.gnSearchQuery?(searchResults.length?searchResults.map(function(n){return'<button data-action="gn-search-result" data-id="'+esc(n.id)+'"><b>'+esc(n.title)+'</b><span>'+esc((n.text||'').replace(/\n/g,' ').slice(0,90))+'</span></button>'}).join(''):'<p>Keine Treffer.</p>'):'<p>Suche aktuell in Titeln und getipptem Text. Handschriftsuche folgt mit OCR.</p>')+'</div></div></div>':'')+
    '</section>',
    false,'notes',true
  );
  gnBindCanvas(note);
  const title=document.getElementById('gnTitle');if(title)title.oninput=function(){gnSaveNote(note.id,{title:title.value||'Unbenannte Seite'})};
  const text=document.getElementById('gnText');if(text)text.oninput=function(){gnSaveNote(note.id,{text:text.value})};
  const zoom=document.getElementById('gnZoom');if(zoom)zoom.oninput=function(){state.gnZoom=Number(zoom.value);document.querySelector('.gn-page-scale').style.width=state.gnZoom+'%';document.querySelector('.gn-zoom span').textContent=state.gnZoom+'%'};
  const pen=document.getElementById('gnPenSize');if(pen)pen.oninput=function(){state.gnPenSize=Number(pen.value);document.querySelector('.gn-tool-options b').textContent=pen.value};
  const marker=document.getElementById('gnMarkerSize');if(marker)marker.oninput=function(){state.gnMarkerSize=Number(marker.value);document.querySelector('.gn-tool-options b').textContent=marker.value};
  const search=document.getElementById('gnSearchInput');if(search){search.focus();search.oninput=function(){state.gnSearchQuery=search.value;renderNotes()}};
}
function gnBindCanvas(note){
  const canvas=document.getElementById('gnCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');let strokes=noteStrokes(note.id),drawing=false,current=null,start=null,last=null,moving=false,moveOrigin=null,moveSnapshot=null;
  function drawShape(s){
    const pts=s.points||[];if(!pts.length)return;
    ctx.strokeStyle=s.color||'#1C2433';ctx.lineWidth=s.width||6;ctx.globalAlpha=s.tool==='marker'?.3:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.stroke();ctx.globalAlpha=1;
  }
  function redraw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);strokes.forEach(drawShape);
    const sel=state.gnSelection;if(sel&&sel.ids&&sel.ids.length){ctx.save();ctx.strokeStyle='#6558D8';ctx.fillStyle='rgba(101,88,216,.05)';ctx.lineWidth=3;ctx.setLineDash([14,10]);ctx.fillRect(sel.x,sel.y,sel.w,sel.h);ctx.strokeRect(sel.x,sel.y,sel.w,sel.h);ctx.restore()}
  }
  function pos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*canvas.width,y:(e.clientY-r.top)/r.height*canvas.height}}
  function eraseAt(p){
    const before=strokes.length;strokes=strokes.filter(function(s){return!gnStrokeHit(s,p,state.gnEraserSize)});
    if(strokes.length!==before){saveNoteStrokes(note.id,strokes);redraw()}
  }
  redraw();
  canvas.onpointerdown=function(e){
    if(state.gnTool==='text')return;
    canvas.setPointerCapture(e.pointerId);const p=pos(e);drawing=true;last=p;
    if(state.gnTool==='eraser'){gnSnapshot(note.id);eraseAt(p);return}
    if(state.gnTool==='select'){
      const sel=state.gnSelection;
      if(gnInsideSelection(p,sel)){moving=true;moveOrigin=p;moveSnapshot=JSON.parse(JSON.stringify(strokes));return}
      state.gnSelection=null;start=p;redraw();return
    }
    gnSnapshot(note.id);current={id:Date.now()+Math.floor(Math.random()*10000),tool:state.gnTool==='marker'?'marker':'pen',color:state.gnTool==='marker'?'#F2C14E':state.gnColor,width:state.gnTool==='marker'?state.gnMarkerSize:state.gnPenSize,points:[p]};strokes.push(current);redraw();
  };
  canvas.onpointermove=function(e){
    if(!drawing)return;const p=pos(e);
    if(state.gnTool==='eraser'){eraseAt(p);last=p;return}
    if(state.gnTool==='select'){
      if(moving&&state.gnSelection&&moveOrigin&&moveSnapshot){
        const dx=p.x-moveOrigin.x,dy=p.y-moveOrigin.y,ids=state.gnSelection.ids;
        strokes=moveSnapshot.map(function(s){return ids.includes(s.id)?Object.assign({},s,{points:(s.points||[]).map(function(q){return{x:q.x+dx,y:q.y+dy}})}):s});
        const base=gnSelectionBounds(moveSnapshot,ids);if(base)state.gnSelection=Object.assign({},base,{x:base.x+dx,y:base.y+dy});
        redraw();return
      }
      if(start){
        const rect={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};
        ctx.clearRect(0,0,canvas.width,canvas.height);strokes.forEach(drawShape);ctx.save();ctx.strokeStyle='#6558D8';ctx.fillStyle='rgba(101,88,216,.05)';ctx.setLineDash([14,10]);ctx.lineWidth=3;ctx.fillRect(rect.x,rect.y,rect.w,rect.h);ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);ctx.restore();return
      }
    }
    if(current){current.points.push(p);redraw()}
    last=p;
  };
  canvas.onpointerup=function(e){
    const p=pos(e);
    if(state.gnTool==='select'){
      if(moving){saveNoteStrokes(note.id,strokes);moving=false;moveOrigin=null;moveSnapshot=null;drawing=false;renderNotes();return}
      if(start){
        const rect={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};
        const ids=strokes.filter(function(s){const b=gnStrokeBounds(s);return !(b.x>rect.x+rect.w||b.x+b.w<rect.x||b.y>rect.y+rect.h||b.y+b.h<rect.y)}).map(function(s){return s.id});
        state.gnSelection=gnSelectionBounds(strokes,ids);start=null;drawing=false;renderNotes();return
      }
    }
    if(current){saveNoteStrokes(note.id,strokes);current=null}
    drawing=false;last=null;
  };
  canvas.onpointercancel=canvas.onpointerup;
}
function gnAddPage(){
  const list=notesStore(),id='n'+Date.now().toString(36),n={id:id,title:'Neue Seite',text:'',paper:'ruled',updatedAt:Date.now()};list.push(n);saveNotesStore(list);state.noteId=id;state.gnSelection=null;renderNotes();
}
function gnLearnSelection(){
  const note=gnCurrentNote(),sel=state.gnSelection;if(!note||!sel||!sel.ids.length){noteStudy();return}
  const canvas=document.getElementById('gnCanvas');if(!canvas)return;
  const crop=document.createElement('canvas');crop.width=Math.max(1,Math.ceil(sel.w));crop.height=Math.max(1,Math.ceil(sel.h));const ctx=crop.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#FFFDF8';ctx.fillRect(0,0,crop.width,crop.height);ctx.drawImage(canvas,sel.x,sel.y,sel.w,sel.h,0,0,crop.width,crop.height);
  crop.toBlob(function(blob){if(!blob)return;state.file=new File([blob],'auswahl.png',{type:'image/png'});state.textDraft=String(note.text||'').trim();analyze()},'image/png');
}

const gnPreviousClick=app.onclick;
app.onclick=function(e){
  const b=e.target.closest('[data-action]');if(!b){if(gnPreviousClick)gnPreviousClick(e);return}
  const a=b.dataset.action;
  if(a==='notes'){state.gnSelection=null;renderNotes();return}
  if(a==='gn-open-page'){state.noteId=b.dataset.id;state.gnSelection=null;renderNotes();return}
  if(a==='gn-add-page'){gnAddPage();return}
  if(a==='gn-tool'){state.gnTool=b.dataset.tool;state.gnSelection=null;renderNotes();return}
  if(a==='gn-color'){state.gnColor=b.dataset.color;if(state.gnSelection)gnColorSelection(state.gnColor);else renderNotes();return}
  if(a==='gn-eraser-size'){state.gnEraserSize=Number(b.dataset.size);renderNotes();return}
  if(a==='gn-undo'){gnUndo();return}
  if(a==='gn-redo'){gnRedo();return}
  if(a==='gn-delete-selection'){gnDeleteSelection();return}
  if(a==='gn-copy-selection'){gnCopySelection();return}
  if(a==='gn-color-selection'){gnColorSelection(b.dataset.color||'#6558D8');return}
  if(a==='gn-learn-selection'){gnLearnSelection();return}
  if(a==='gn-search'){state.gnSearchOpen=true;renderNotes();return}
  if(a==='gn-search-close'){state.gnSearchOpen=false;state.gnSearchQuery='';renderNotes();return}
  if(a==='gn-search-result'){state.noteId=b.dataset.id;state.gnSearchOpen=false;state.gnSearchQuery='';renderNotes();return}
  if(a==='gn-page-menu'){state.gnPageMenu=!state.gnPageMenu;renderNotes();return}
  if(a==='gn-duplicate-page'){gnDuplicatePage();return}
  if(a==='gn-delete-page'){gnDeletePage();return}
  if(a==='gn-move-up'){gnMovePage(-1);return}
  if(a==='gn-move-down'){gnMovePage(1);return}
  if(a==='gn-export'){gnExportPNG();state.gnPageMenu=false;return}
  if(a==='note-study'&&state.gnSelection&&state.gnSelection.ids&&state.gnSelection.ids.length){gnLearnSelection();return}
  if(gnPreviousClick)gnPreviousClick(e);
};



/* SnapStudy Notes V3 — real editor mechanics */
V4_ICONS.eraser='<path d="m7 18-3-3 9-9 5 5-7 7H7Z"/><path d="M11 18h8"/>';
V4_ICONS.shape='<rect x="4" y="4" width="7" height="7" rx="1"/><circle cx="16.5" cy="16.5" r="3.5"/>';
V4_ICONS.image='<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m21 15-5-5L5 20"/>';
V4_ICONS.star='<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>';
V4_ICONS.fit='<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>';
V4_ICONS.pdf='<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4"/><path d="M8 15h8"/><path d="M8 18h5"/>';
V4_ICONS.bookmark='<path d="M7 4h10v17l-5-3-5 3V4Z"/>';

if(!state.gnEraserMode) state.gnEraserMode='stroke';
if(!state.gnShapeKind) state.gnShapeKind='line';
if(!state.gnFocus) state.gnFocus=false;
if(!state.gnPointer) state.gnPointer=null;
if(!state.gnSelectedImage) state.gnSelectedImage=null;

function gn3Shapes(id){return v4Load('snapstudy-note-shapes-'+id,[])}
function gn3SaveShapes(id,v){v4Save('snapstudy-note-shapes-'+id,v)}
function gn3Images(id){return v4Load('snapstudy-note-images-'+id,[])}
function gn3SaveImages(id,v){v4Save('snapstudy-note-images-'+id,v)}
function gn3HitStroke(s,p,r){
  const pts=s.points||[];if(!pts.length)return false;
  if(pts.length===1)return Math.hypot(pts[0].x-p.x,pts[0].y-p.y)<=r+(s.width||0)/2;
  for(let i=1;i<pts.length;i++)if(gnPointSegDistance(p,pts[i-1],pts[i])<=r+(s.width||0)/2)return true;
  return false;
}
function gn3PrecisionErase(strokes,p,r){
  const out=[];
  strokes.forEach(function(s){
    const pts=s.points||[];if(pts.length<2){if(!gn3HitStroke(s,p,r))out.push(s);return}
    let group=[];
    function flush(){if(group.length>1){out.push(Object.assign({},s,{id:Date.now()+Math.floor(Math.random()*1e6),points:group}))}group=[]}
    for(let i=0;i<pts.length;i++){
      const hit=i===0?Math.hypot(pts[i].x-p.x,pts[i].y-p.y)<=r:gnPointSegDistance(p,pts[i-1],pts[i])<=r;
      if(hit)flush();else group.push(pts[i]);
    }
    flush();
  });
  return out;
}
function gn3ShapeList(noteId){return gn3Shapes(noteId)}
function gn3ImageList(noteId){return gn3Images(noteId)}
function gn3PaperThumb(paper){
  return '<span class="gn3-thumb '+esc(paper||'ruled')+'"></span>';
}
function gn3SetPaper(paper){gnSaveNotePatch(state.noteId,{paper:paper});renderNotes()}
function gn3ToggleFavorite(){
  const n=gnCurrentNote();if(!n)return;gnSaveNotePatch(n.id,{favorite:!n.favorite});renderNotes()
}
function gn3AddShape(kind,a,b){
  const list=gn3ShapeList(state.noteId);
  list.push({id:'s'+Date.now()+Math.random(),kind:kind,x1:a.x,y1:a.y,x2:b.x,y2:b.y,color:state.gnColor,width:state.gnPenSize});
  gn3SaveShapes(state.noteId,list)
}
function gn3ResizeImage(id,factor){
  const list=gn3ImageList(state.noteId).map(function(im){return im.id===id?Object.assign({},im,{w:Math.max(80,im.w*factor),h:Math.max(60,im.h*factor)}):im});
  gn3SaveImages(state.noteId,list);renderNotes()
}
function gn3DeleteImage(id){gn3SaveImages(state.noteId,gn3ImageList(state.noteId).filter(function(im){return im.id!==id}));state.gnSelectedImage=null;renderNotes()}
function gn3InsertImage(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(){
    const img=new Image();
    img.onload=function(){
      const max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(120,img.width*scale),h=Math.max(90,img.height*scale);
      const tmp=document.createElement('canvas');tmp.width=Math.round(w);tmp.height=Math.round(h);
      const t=tmp.getContext('2d');if(!t)return;t.drawImage(img,0,0,tmp.width,tmp.height);
      const src=tmp.toDataURL('image/jpeg',.8),list=gn3ImageList(state.noteId),id='i'+Date.now();
      list.push({id:id,src:src,x:500-w/2,y:500-h/2,w:w,h:h});gn3SaveImages(state.noteId,list);state.gnSelectedImage=id;state.gnTool='select';renderNotes()
    };
    img.src=reader.result;
  };
  reader.readAsDataURL(file)
}
function gn3DuplicateNote(){
  const list=notesStore(),n=gnCurrentNote();if(!n)return;
  const id='n'+Date.now().toString(36),copy=Object.assign({},n,{id:id,title:(n.title||'Seite')+' Kopie',favorite:false,updatedAt:Date.now()});
  const idx=list.findIndex(function(x){return x.id===n.id});list.splice(idx+1,0,copy);saveNotesStore(list);
  saveNoteStrokes(id,JSON.parse(JSON.stringify(noteStrokes(n.id))));
  gn3SaveShapes(id,JSON.parse(JSON.stringify(gn3Shapes(n.id))));
  gn3SaveImages(id,JSON.parse(JSON.stringify(gn3Images(n.id))));
  state.noteId=id;state.gnSelection=null;renderNotes()
}
function gn3ExportPage(){
  const note=gnCurrentNote();if(!note)return;
  const out=document.createElement('canvas');out.width=1000;out.height=1400;const ctx=out.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#fffefb';ctx.fillRect(0,0,1000,1400);ctx.strokeStyle='#e7e3da';ctx.lineWidth=1;
  if(note.paper==='ruled')for(let y=64;y<1400;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1000,y);ctx.stroke()}
  if(note.paper==='grid')for(let a=0;a<1400;a+=48){ctx.beginPath();ctx.moveTo(0,a);ctx.lineTo(1000,a);ctx.stroke()} 
  if(note.paper==='grid')for(let a=0;a<1000;a+=48){ctx.beginPath();ctx.moveTo(a,0);ctx.lineTo(a,1400);ctx.stroke()}
  if(note.paper==='dotted'){ctx.fillStyle='#d8d4cc';for(let y=24;y<1400;y+=36)for(let x=24;x<1000;x+=36){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill()}}
  ctx.fillStyle='#30343a';ctx.font='28px Georgia';ctx.textBaseline='top';String(note.text||'').split('\n').forEach(function(line,i){ctx.fillText(line,70,75+i*44,850)});
  gn3Shapes(note.id).forEach(function(s){ctx.strokeStyle=s.color;ctx.lineWidth=s.width||5;ctx.beginPath();if(s.kind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2)}else if(s.kind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1))}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2)}ctx.stroke()});
  noteStrokes(note.id).forEach(function(s){const pts=s.points||[];if(pts.length<2)return;ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.tool==='marker'?.3:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.globalAlpha=1});
  const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download=(note.title||'Notiz').replace(/[^a-z0-9äöüß_-]+/gi,'-')+'.png';a.click()
}
function gn3ToolOptions(){
  if(state.gnTool==='pen')return '<div class="gn3-options"><span>Stift</span><input id="gnPenSize" type="range" min="2" max="16" value="'+state.gnPenSize+'"><b>'+state.gnPenSize+'</b></div>';
  if(state.gnTool==='marker')return '<div class="gn3-options"><span>Marker</span><input id="gnMarkerSize" type="range" min="14" max="64" value="'+state.gnMarkerSize+'"><b>'+state.gnMarkerSize+'</b></div>';
  if(state.gnTool==='eraser')return '<div class="gn3-options"><span>Radierer</span><div class="gn3-segment"><button data-action="gn3-erase-mode" data-mode="stroke" class="'+(state.gnEraserMode==='stroke'?'active':'')+'">Strich</button><button data-action="gn3-erase-mode" data-mode="precision" class="'+(state.gnEraserMode==='precision'?'active':'')+'">Präzise</button></div><div class="gn3-segment">'+[34,58,92].map(function(v){return'<button data-action="gn-eraser-size" data-size="'+v+'" class="'+(state.gnEraserSize===v?'active':'')+'">'+(v===34?'S':v===58?'M':'L')+'</button>'}).join('')+'</div><small>Wische durchgehend über Linien.</small></div>';
  if(state.gnTool==='shape')return '<div class="gn3-options"><span>Form</span><div class="gn3-segment"><button data-action="gn3-shape-kind" data-kind="line" class="'+(state.gnShapeKind==='line'?'active':'')+'">Linie</button><button data-action="gn3-shape-kind" data-kind="rect" class="'+(state.gnShapeKind==='rect'?'active':'')+'">Rechteck</button><button data-action="gn3-shape-kind" data-kind="ellipse" class="'+(state.gnShapeKind==='ellipse'?'active':'')+'">Ellipse</button></div></div>';
  if(state.gnTool==='select')return '<div class="gn3-options"><span>Lasso</span><small>Auswählen, verschieben, kopieren, färben oder löschen.</small></div>';
  if(state.gnTool==='text')return '<div class="gn3-options"><span>Text</span><small>Tippe direkt auf der Seite.</small></div>';
  return ''
}
function renderNotes(){
  const list=notesStore(),note=gnCurrentNote();if(!note){gnAddPage();return}
  const shapes=gn3ShapeList(note.id),images=gn3ImageList(note.id),sel=state.gnSelection,selectedImage=images.find(function(x){return x.id===state.gnSelectedImage});
  const pages=list.map(function(n,i){return'<button class="gn3-page '+(n.id===note.id?'active':'')+'" data-action="gn-open-page" data-id="'+esc(n.id)+'">'+gn3PaperThumb(n.paper)+'<span><b>'+(n.favorite?'★ ':'')+esc(n.title)+'</b><small>Seite '+(i+1)+'</small></span></button>'}).join('');
  app.innerHTML=shell(
    '<section class="gn3-shell '+(state.gnFocus?'focus':'')+'">'+
      '<header class="gn3-head"><button data-action="today" class="gn3-square">'+v4Icon('back',19)+'</button><div class="gn3-title"><span>Physik / Notizen</span><input id="gnTitle" value="'+esc(note.title)+'"></div><button data-action="gn3-favorite" class="gn3-square '+(note.favorite?'fav':'')+'">'+v4Icon('star',18)+'</button><button data-action="gn-search" class="gn3-square">'+v4Icon('search',18)+'</button><button data-action="gn3-focus" class="gn3-square">'+v4Icon('fit',18)+'</button></header>'+
      '<div class="gn3-main">'+
        (!state.gnFocus?'<aside class="gn3-sidebar"><div class="gn3-sidehead"><strong>Seiten</strong><button data-action="gn-add-page">'+v4Icon('plus',16)+'</button></div><div class="gn3-pages">'+pages+'</div><div class="gn3-pageactions"><button data-action="gn3-duplicate">Duplizieren</button><button data-action="gn-delete-page">Löschen</button><button data-action="gn-move-up">↑</button><button data-action="gn-move-down">↓</button></div></aside>':'')+
        '<main class="gn3-editor">'+
          (!state.gnFocus?'<div class="gn3-toolbar">'+
            [['pen','text','Stift'],['marker','spark','Marker'],['eraser','eraser','Radierer'],['select','stack','Lasso'],['text','text','Text'],['shape','shape','Formen']].map(function(x){return'<button data-action="gn-tool" data-tool="'+x[0]+'" class="'+(state.gnTool===x[0]?'active':'')+'">'+v4Icon(x[1],18)+'<span>'+x[2]+'</span></button>'}).join('')+
            '<span class="gn3-divider"></span>'+
            ['#20242B','#5C5FB8','#B75850','#26785B','#D39A23'].map(function(col){return'<button data-action="gn-color" data-color="'+col+'" class="gn3-color '+(state.gnColor===col?'active':'')+'" style="--c:'+col+'"></button>'}).join('')+
            '<span class="gn3-flex"></span><button class="gn3-icon" data-action="gn-undo">'+v4Icon('undo',17)+'</button><button class="gn3-icon" data-action="gn-redo">'+v4Icon('redo',17)+'</button>'+
            '<label class="gn3-icon gn3-image">'+v4Icon('image',17)+'<input id="gn3ImageInput" type="file" accept="image/*"></label>'+
          '</div>'+gn3ToolOptions():'')+
          '<div class="gn3-docbar">'+
            '<select id="gn3Paper"><option value="plain" '+(note.paper==='plain'?'selected':'')+'>Blanko</option><option value="ruled" '+(note.paper==='ruled'?'selected':'')+'>Liniert</option><option value="grid" '+(note.paper==='grid'?'selected':'')+'>Kariert</option><option value="dotted" '+(note.paper==='dotted'?'selected':'')+'>Punktiert</option></select>'+
            '<button data-action="gn3-pdf" title="PDF Import">'+v4Icon('pdf',16)+'<span>PDF</span></button><span class="gn3-flex"></span><button data-action="gn3-export">'+v4Icon('download',16)+'<span>PNG</span></button>'+
          '</div>'+
          '<div class="gn3-stage"><div class="gn3-scale" style="width:'+state.gnZoom+'%"><div class="gn3-paper '+esc(note.paper||'ruled')+'"><textarea id="gnText" class="'+(state.gnTool==='text'?'editing':'')+'" placeholder="Text eingeben...">'+esc(note.text||'')+'</textarea><canvas id="gnCanvas" width="1000" height="1400"></canvas></div></div></div>'+
          (!state.gnFocus?'<footer class="gn3-bottom"><button data-action="gn3-fit">'+v4Icon('fit',16)+'</button><input id="gnZoom" type="range" min="70" max="180" value="'+state.gnZoom+'"><span>'+state.gnZoom+'%</span><button data-action="mark-note-review">'+v4Icon('repeat',15)+'Wiederholen</button><button class="primary" data-action="note-study">'+v4Icon('play',15)+(sel&&sel.ids&&sel.ids.length?'Aus Auswahl lernen':'Lernrunde')+'</button></footer>':'')+
        '</main>'+
      '</div>'+
      (sel&&sel.ids&&sel.ids.length?'<div class="gn3-selection"><span>'+sel.ids.length+' ausgewählt</span><button data-action="gn-copy-selection">'+v4Icon('copy',16)+'</button><button data-action="gn-color-selection" data-color="'+state.gnColor+'"><i style="background:'+state.gnColor+'"></i></button><button data-action="gn-learn-selection">'+v4Icon('play',16)+'</button><button class="danger" data-action="gn-delete-selection">'+v4Icon('trash',16)+'</button></div>':'')+
      (selectedImage?'<div class="gn3-imagebar"><span>Bild</span><button data-action="gn3-image-smaller">−</button><button data-action="gn3-image-larger">+</button><button class="danger" data-action="gn3-image-delete">'+v4Icon('trash',15)+'</button></div>':'')+
    '</section>',false,'notes',true
  );
  gnBindCanvas(note,shapes,images);
  const title=document.getElementById('gnTitle');if(title)title.oninput=function(){gnSaveNotePatch(note.id,{title:title.value||'Unbenannt'})};
  const text=document.getElementById('gnText');if(text)text.oninput=function(){gnSaveNotePatch(note.id,{text:text.value})};
  const paper=document.getElementById('gn3Paper');if(paper)paper.onchange=function(){gn3SetPaper(paper.value)};
  const zoom=document.getElementById('gnZoom');if(zoom)zoom.oninput=function(){state.gnZoom=Number(zoom.value);document.querySelector('.gn3-scale').style.width=zoom.value+'%';document.querySelector('.gn3-bottom>span').textContent=zoom.value+'%'};
  const pen=document.getElementById('gnPenSize');if(pen)pen.oninput=function(){state.gnPenSize=Number(pen.value);document.querySelector('.gn3-options b').textContent=pen.value};
  const marker=document.getElementById('gnMarkerSize');if(marker)marker.oninput=function(){state.gnMarkerSize=Number(marker.value);document.querySelector('.gn3-options b').textContent=marker.value};
  const imageInput=document.getElementById('gn3ImageInput');if(imageInput)imageInput.onchange=function(){const file=imageInput.files&&imageInput.files[0];if(file)gn3InsertImage(file);imageInput.value=''}
}
function gnBindCanvas(note,shapes,images){
  const canvas=document.getElementById('gnCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');let strokes=noteStrokes(note.id),drawing=false,current=null,start=null,moving=false,moveOrigin=null,moveSnapshot=null,shapeStart=null,shapePreview=null,imageDrag=null,eraseStarted=false,pointer=null;
  function drawAll(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    images.forEach(function(im){const img=new Image();img.src=im.src;if(img.complete)ctx.drawImage(img,im.x,im.y,im.w,im.h);else img.onload=function(){drawAll()}});
    shapes.forEach(function(s){ctx.save();ctx.strokeStyle=s.color;ctx.lineWidth=s.width||5;ctx.beginPath();if(s.kind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2)}else if(s.kind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1))}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2)}ctx.stroke();ctx.restore()});
    strokes.forEach(function(s){const pts=s.points||[];if(!pts.length)return;ctx.save();ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.tool==='marker'?.3:1;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()});
    const sel=state.gnSelection;if(sel&&sel.ids&&sel.ids.length){ctx.save();ctx.strokeStyle='#555b64';ctx.fillStyle='rgba(50,55,62,.04)';ctx.lineWidth=2;ctx.setLineDash([11,8]);ctx.fillRect(sel.x,sel.y,sel.w,sel.h);ctx.strokeRect(sel.x,sel.y,sel.w,sel.h);ctx.restore()}
    if(shapePreview){ctx.save();ctx.strokeStyle=state.gnColor;ctx.lineWidth=state.gnPenSize;ctx.setLineDash([8,6]);ctx.beginPath();const s=shapePreview;if(state.gnShapeKind==='line'){ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2)}else if(state.gnShapeKind==='rect'){ctx.rect(Math.min(s.x1,s.x2),Math.min(s.y1,s.y2),Math.abs(s.x2-s.x1),Math.abs(s.y2-s.y1))}else{ctx.ellipse((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.abs(s.x2-s.x1)/2,Math.abs(s.y2-s.y1)/2,0,0,Math.PI*2)}ctx.stroke();ctx.restore()}
    if(state.gnTool==='eraser'&&pointer){ctx.save();ctx.fillStyle='rgba(255,255,255,.55)';ctx.strokeStyle='#4d535c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pointer.x,pointer.y,state.gnEraserSize,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}
  }
  function posFromClient(x,y){const r=canvas.getBoundingClientRect();return{x:(x-r.left)/r.width*canvas.width,y:(y-r.top)/r.height*canvas.height}}
  function pointsFromEvent(e){const raw=e;if(typeof raw.getCoalescedEvents==='function'){const arr=raw.getCoalescedEvents();if(arr&&arr.length)return arr.map(function(x){return posFromClient(x.clientX,x.clientY)})}return[posFromClient(e.clientX,e.clientY)]}
  function erasePoints(points){
    let changed=false;
    points.forEach(function(p){
      if(state.gnEraserMode==='precision'){const next=gn3PrecisionErase(strokes,p,state.gnEraserSize);if(JSON.stringify(next)!==JSON.stringify(strokes)){strokes=next;changed=true}}
      else{const next=strokes.filter(function(s){return!gn3HitStroke(s,p,state.gnEraserSize)});if(next.length!==strokes.length){strokes=next;changed=true}}
    });
    if(changed)saveNoteStrokes(note.id,strokes);drawAll()
  }
  function down(e){
    e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=posFromClient(e.clientX,e.clientY);pointer=p;drawing=true;
    if(state.gnTool==='eraser'){if(!eraseStarted){gnSnapshot(note.id);eraseStarted=true}erasePoints([p]);return}
    if(state.gnTool==='select'){
      const img=images.find(function(im){return p.x>=im.x&&p.x<=im.x+im.w&&p.y>=im.y&&p.y<=im.y+im.h});
      if(img){state.gnSelectedImage=img.id;imageDrag={id:img.id,start:p,x:img.x,y:img.y};drawAll();return}
      state.gnSelectedImage=null;
      const sel=state.gnSelection;if(gnInsideSelection(p,sel)){moving=true;moveOrigin=p;moveSnapshot=JSON.parse(JSON.stringify(strokes));gnSnapshot(note.id);return}
      state.gnSelection=null;start=p;drawAll();return
    }
    if(state.gnTool==='shape'){shapeStart=p;shapePreview={x1:p.x,y1:p.y,x2:p.x,y2:p.y};drawAll();return}
    if(state.gnTool==='text')return;
    gnSnapshot(note.id);current={id:Date.now()+Math.floor(Math.random()*9999),tool:state.gnTool==='marker'?'marker':'pen',color:state.gnTool==='marker'?'#F0C94D':state.gnColor,width:state.gnTool==='marker'?state.gnMarkerSize:state.gnPenSize,points:[p]};strokes.push(current);drawAll()
  }
  function move(e){
    if(state.gnTool==='eraser'){pointer=posFromClient(e.clientX,e.clientY);if(drawing)erasePoints(pointsFromEvent(e));else drawAll();return}
    if(!drawing)return;const p=posFromClient(e.clientX,e.clientY);
    if(imageDrag){const dx=p.x-imageDrag.start.x,dy=p.y-imageDrag.start.y;const next=gn3ImageList(note.id).map(function(im){return im.id===imageDrag.id?Object.assign({},im,{x:imageDrag.x+dx,y:imageDrag.y+dy}):im});gn3SaveImages(note.id,next);images=next;drawAll();return}
    if(state.gnTool==='select'){
      if(moving&&state.gnSelection&&moveOrigin&&moveSnapshot){const dx=p.x-moveOrigin.x,dy=p.y-moveOrigin.y,ids=state.gnSelection.ids;strokes=moveSnapshot.map(function(s){return ids.includes(s.id)?Object.assign({},s,{points:(s.points||[]).map(function(q){return{x:q.x+dx,y:q.y+dy}})}):s});const base=gnSelectionBounds(moveSnapshot,ids);if(base)state.gnSelection=Object.assign({},base,{x:base.x+dx,y:base.y+dy});drawAll();return}
      if(start){const rect={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};drawAll();ctx.save();ctx.strokeStyle='#555b64';ctx.setLineDash([11,8]);ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);ctx.restore();return}
    }
    if(state.gnTool==='shape'&&shapeStart){shapePreview={x1:shapeStart.x,y1:shapeStart.y,x2:p.x,y2:p.y};drawAll();return}
    if(current){const pts=pointsFromEvent(e);current.points.push.apply(current.points,pts);drawAll()}
  }
  function up(e){
    const p=posFromClient(e.clientX,e.clientY);
    if(state.gnTool==='eraser'){drawing=false;eraseStarted=false;pointer=p;drawAll();return}
    if(imageDrag){imageDrag=null;drawing=false;renderNotes();return}
    if(state.gnTool==='select'){
      if(moving){saveNoteStrokes(note.id,strokes);moving=false;moveOrigin=null;moveSnapshot=null;drawing=false;renderNotes();return}
      if(start){const rect={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};const ids=strokes.filter(function(s){const b=gnStrokeBounds(s);return !(b.x>rect.x+rect.w||b.x+b.w<rect.x||b.y>rect.y+rect.h||b.y+b.h<rect.y)}).map(function(s){return s.id});state.gnSelection=gnSelectionBounds(strokes,ids);start=null;drawing=false;renderNotes();return}
    }
    if(state.gnTool==='shape'&&shapePreview){gn3AddShape(state.gnShapeKind,{x:shapePreview.x1,y:shapePreview.y1},{x:shapePreview.x2,y:shapePreview.y2});shapePreview=null;shapeStart=null;drawing=false;renderNotes();return}
    if(current){saveNoteStrokes(note.id,strokes);current=null}drawing=false
  }
  canvas.style.touchAction='none';canvas.style.cursor=state.gnTool==='eraser'?'none':'crosshair';
  canvas.addEventListener('pointerdown',down,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',up,{passive:false});canvas.addEventListener('pointercancel',up,{passive:false});
  if('onpointerrawupdate' in canvas)canvas.addEventListener('pointerrawupdate',move,{passive:false});
  canvas.addEventListener('pointerleave',function(){if(!drawing){pointer=null;drawAll()}});
  drawAll()
}
const gn3PrevClick=app.onclick;
app.onclick=function(e){
  const b=e.target.closest('[data-action]');if(!b){if(gn3PrevClick)gn3PrevClick(e);return}
  const a=b.dataset.action;
  if(a==='notes'){state.gnSelection=null;renderNotes();return}
  if(a==='gn-tool'){state.gnTool=b.dataset.tool;state.gnSelection=null;state.gnSelectedImage=null;renderNotes();return}
  if(a==='gn3-erase-mode'){state.gnEraserMode=b.dataset.mode;renderNotes();return}
  if(a==='gn3-shape-kind'){state.gnShapeKind=b.dataset.kind;renderNotes();return}
  if(a==='gn3-favorite'){gn3ToggleFavorite();return}
  if(a==='gn3-focus'){state.gnFocus=!state.gnFocus;renderNotes();return}
  if(a==='gn3-fit'){state.gnZoom=100;renderNotes();return}
  if(a==='gn3-duplicate'){gn3DuplicateNote();return}
  if(a==='gn3-export'){gn3ExportPage();return}
  if(a==='gn3-pdf'){v4Toast('PDF-Import folgt in der nächsten Beta');return}
  if(a==='gn3-image-smaller'&&state.gnSelectedImage){gn3ResizeImage(state.gnSelectedImage,.9);return}
  if(a==='gn3-image-larger'&&state.gnSelectedImage){gn3ResizeImage(state.gnSelectedImage,1.1);return}
  if(a==='gn3-image-delete'&&state.gnSelectedImage){gn3DeleteImage(state.gnSelectedImage);return}
  if(gn3PrevClick)gn3PrevClick(e)
};
