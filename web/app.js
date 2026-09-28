const app = document.getElementById('app');
let deferredInstall = null;
const state = {
  view: 'home',
  file: null,
  preview: '',
  challenge: null,
  qIndex: 0,
  score: 0,
  answered: false,
  lastCorrect: false,
  lastExplanation: '',
  loading: false,
  error: '',
  invite: null
};

const sampleAnalysis = {
  title: 'Lineare Gleichung',
  topic: 'Gleichungen',
  originalText: 'Löse 3x + 5 = 20.',
  strategySelection: {
    question: 'Welche Strategie ist hier am sinnvollsten?',
    options: ['Zuerst 5 auf beiden Seiten subtrahieren', 'Zuerst beide Seiten quadrieren', 'Mit dem Satz des Pythagoras arbeiten'],
    correctOption: 'Zuerst 5 auf beiden Seiten subtrahieren',
    explanation: 'Du isolierst x schrittweise mit Umkehroperationen.'
  },
  reasoningSteps: [
    { question: 'Was erhältst du nach dem Subtrahieren von 5?', answer: '3x = 15', explanation: '20 - 5 = 15, links bleibt 3x.' },
    { question: 'Welche Operation isoliert x danach?', answer: 'durch 3 teilen', choices: ['durch 3 teilen', 'mit 3 multiplizieren', '5 addieren'], explanation: 'Beide Seiten werden durch den Koeffizienten 3 geteilt.' },
    { question: 'Wie groß ist x?', answer: '5', explanation: '15 geteilt durch 3 ergibt 5.' }
  ],
  correctResult: {
    display: 'x = 5',
    acceptedAnswers: ['5', 'x=5', 'x = 5'],
    explanation: 'Probe: 3·5 + 5 = 20.'
  }
};

function esc(value) {
  return String(value == null ? '' : value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function normalize(value) {
  return String(value || '').toLowerCase().trim().replaceAll(',', '.').replace(/\s+/g, '').replace(/[·*]/g, 'x').replace(/[.;:!?]/g, '');
}
function encodeChallenge(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach(function (b) { binary += String.fromCharCode(b); });
  return btoa(binary);
}
function decodeChallenge(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, function (c) { return c.charCodeAt(0); });
  return JSON.parse(new TextDecoder().decode(bytes));
}
function today() { return new Date().toISOString().slice(0, 10); }
function usage() {
  const raw = JSON.parse(localStorage.getItem('snapstudy-usage') || '{}');
  return raw.day === today() ? raw.count || 0 : 0;
}
function remaining() { return Math.max(0, 3 - usage()); }
function consumeCreation() {
  localStorage.setItem('snapstudy-usage', JSON.stringify({ day: today(), count: usage() + 1 }));
}
function profile() {
  return JSON.parse(localStorage.getItem('snapstudy-profile') || '{"xp":0,"best":0,"streak":0,"last":""}');
}
function saveResult(score) {
  const p = profile();
  const d = today();
  let streak = p.streak || 0;
  if (p.last !== d) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = p.last === yesterday ? streak + 1 : 1;
  }
  p.streak = streak;
  p.last = d;
  p.xp = (p.xp || 0) + score + (score === 100 ? 25 : 0);
  p.best = Math.max(p.best || 0, score);
  localStorage.setItem('snapstudy-profile', JSON.stringify(p));
  return p;
}
function saveRecent(challenge) {
  const list = JSON.parse(localStorage.getItem('snapstudy-recent') || '[]');
  const item = { title: challenge.title, topic: challenge.topic, at: Date.now() };
  localStorage.setItem('snapstudy-recent', JSON.stringify([item].concat(list).slice(0, 4)));
}
function challengeFromAnalysis(a) {
  const questions = [];
  if (a.strategySelection) {
    questions.push({
      prompt: a.strategySelection.question,
      choices: a.strategySelection.options || [],
      accepted: [a.strategySelection.correctOption],
      explanation: a.strategySelection.explanation || ''
    });
  }
  (a.reasoningSteps || []).slice(0, 3).forEach(function (step) {
    questions.push({
      prompt: step.question,
      choices: step.choices || [],
      accepted: [step.answer],
      explanation: step.explanation || step.hint || ''
    });
  });
  questions.push({
    prompt: 'Was ist das Endergebnis?',
    choices: [],
    accepted: [a.correctResult && a.correctResult.display].concat((a.correctResult && a.correctResult.acceptedAnswers) || []).filter(Boolean),
    explanation: (a.correctResult && a.correctResult.explanation) || ''
  });
  return {
    version: 1,
    title: a.title || 'Neue Challenge',
    topic: a.topic || 'Lernen',
    source: a.originalText || '',
    questions: questions.slice(0, 5)
  };
}
function isCorrect(question, answer) {
  const n = normalize(answer);
  return (question.accepted || []).some(function (candidate) {
    const c = normalize(candidate);
    return n === c || (n.length > 1 && c.length > 1 && (n.includes(c) || c.includes(n)));
  });
}
function topbar(showBack) {
  const p = profile();
  return '<div class="topbar">' +
    '<div class="brand"><div class="mark">S</div><span>SnapStudy</span></div>' +
    '<div class="mini-stats"><span class="mini">⚡ ' + esc(p.xp || 0) + ' XP</span><span class="mini">🔥 ' + esc(p.streak || 0) + '</span></div>' +
  '</div>' +
  (showBack ? '<button class="back" data-action="home" aria-label="Zurück">←</button>' : '');
}
function shell(content, showBack) {
  return '<main class="shell">' + topbar(showBack) + content + '</main>';
}
function renderHome() {
  state.view = 'home';
  state.error = '';
  const p = profile();
  const recent = JSON.parse(localStorage.getItem('snapstudy-recent') || '[]');
  let recentHtml = '';
  if (recent.length) {
    recentHtml = '<section class="section"><div class="section-head"><div class="section-title">Zuletzt gelernt</div><div class="small">Bestwert ' + esc(p.best || 0) + '%</div></div><div class="stack">' +
      recent.slice(0, 3).map(function (r) {
        return '<div class="card flat"><span class="pill">' + esc(r.topic) + '</span><div style="font-weight:800;margin-top:10px">' + esc(r.title) + '</div></div>';
      }).join('') + '</div></section>';
  }
  app.innerHTML = shell(
    '<section class="hero"><div class="eyebrow">' + remaining() + ' von 3 Challenges heute frei</div>' +
    '<h1>Aus Lernstoff wird ein Spiel.</h1><p class="lead">Foto oder Text rein. SnapStudy baut daraus sofort eine kurze 5‑Fragen‑Challenge.</p></section>' +
    '<div class="grid2">' +
      '<button class="action-card primary" data-action="create"><div class="action-icon">⌁</div><div class="action-title">Foto scannen</div><div class="action-sub">Arbeitsblatt, Buchseite oder Notizen</div></button>' +
      '<button class="action-card" data-action="create-text"><div class="action-icon">Aa</div><div class="action-title">Text einfügen</div><div class="action-sub">Thema oder Aufgabe direkt eingeben</div></button>' +
    '</div>' +
    '<section class="section"><div class="premium"><div><strong>SnapStudy Plus</strong><span class="small">Unbegrenzt · Prüfungsmodus · Statistiken</span></div><span class="pill brand">bald</span></div></section>' +
    recentHtml +
    '<section class="section"><button class="btn secondary block" data-action="sample">Demo-Challenge starten</button></section>',
    false
  );
}
function renderCreate(textOnly) {
  state.view = 'create';
  if (remaining() <= 0) {
    app.innerHTML = shell('<section class="hero"><div class="eyebrow">Tageslimit</div><h2>3 kostenlose Challenges verbraucht.</h2><p class="lead">Du kannst geteilte Challenges weiter spielen. Neue eigene Challenges sind morgen wieder frei.</p></section><button class="btn block" data-action="home">Zur Startseite</button>', true);
    return;
  }
  const preview = state.preview ? '<img class="preview" src="' + esc(state.preview) + '" alt="Vorschau" />' : '';
  const upload = textOnly ? '' :
    '<label class="field-label">Foto oder Screenshot</label><div class="upload">' + preview +
      '<input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" />' +
      (!state.preview ? '<div class="upload-copy"><div style="font-size:28px">⌁</div><strong>Bild auswählen oder aufnehmen</strong><span class="small">JPG, PNG, WEBP, HEIC · max. 8 MB</span></div>' : '') +
    '</div>';
  app.innerHTML = shell(
    '<section class="hero"><div class="eyebrow">Neue Challenge</div><h2>' + (textOnly ? 'Was willst du lernen?' : 'Zeig mir deinen Lernstoff.') + '</h2><p class="lead">Die KI liest den Inhalt und macht daraus fünf kurze Fragen. Keine Chat-Oberfläche.</p></section>' +
    '<div class="stack">' + upload +
      '<div><label class="field-label" for="studyText">' + (textOnly ? 'Text oder Thema' : 'Optionaler Text / Korrektur') + '</label><textarea id="studyText" placeholder="z. B. Newtonsche Gravitation, Keplers Gesetze oder kopierter Aufgabentext"></textarea></div>' +
      (state.error ? '<div class="error">' + esc(state.error) + '</div>' : '') +
      '<button class="btn block" data-action="analyze">' + (state.loading ? '<span class="loader"></span> Challenge wird gebaut…' : '5‑Fragen‑Challenge erstellen') + '</button>' +
      '<div class="small center">' + remaining() + ' kostenlose Erstellung' + (remaining() === 1 ? '' : 'en') + ' heute übrig</div>' +
    '</div>',
    true
  );
  const input = document.getElementById('photoInput');
  if (input) {
    input.addEventListener('change', function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        state.error = 'Das Bild ist größer als 8 MB.';
        renderCreate(false);
        return;
      }
      state.file = file;
      if (state.preview) URL.revokeObjectURL(state.preview);
      state.preview = URL.createObjectURL(file);
      renderCreate(false);
    });
  }
}
function renderLoading() {
  app.innerHTML = shell(
    '<section class="hero"><div class="eyebrow">KI-Analyse</div><h2>Challenge wird gebaut.</h2><p class="lead">Inhalt erkennen → Lernziel bestimmen → fünf Fragen erzeugen.</p></section>' +
    '<div class="card center"><div class="loader" style="margin:12px auto;border-color:var(--surface-2);border-top-color:var(--brand)"></div><div class="small">Das kann bei einem kalten Serverstart etwas dauern.</div></div>',
    false
  );
}
async function analyze() {
  const textEl = document.getElementById('studyText');
  const text = textEl ? textEl.value.trim() : '';
  if (!state.file && text.length < 10) {
    state.error = 'Füge ein Bild hinzu oder gib mindestens etwa einen Satz Lernstoff ein.';
    renderCreate(!state.file);
    return;
  }
  state.loading = true;
  state.error = '';
  renderLoading();
  try {
    let response;
    if (state.file) {
      const form = new FormData();
      form.append('image', state.file, state.file.name || 'scan.jpg');
      form.append('text', text);
      response = await fetch('/api/analyze', { method: 'POST', body: form });
    } else {
      response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: text })
      });
    }
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || 'Die KI-Analyse ist fehlgeschlagen.');
    const challenge = challengeFromAnalysis(payload);
    if (!challenge.questions || challenge.questions.length < 5) throw new Error('Die Analyse war unvollständig.');
    consumeCreation();
    saveRecent(challenge);
    startChallenge(challenge);
  } catch (error) {
    state.loading = false;
    state.error = (error && error.message ? error.message : 'Analyse fehlgeschlagen.') + ' Du kannst die Demo starten, während die Cloud-Konfiguration geprüft wird.';
    state.file = null;
    if (state.preview) URL.revokeObjectURL(state.preview);
    state.preview = '';
    app.innerHTML = shell(
      '<section class="hero"><div class="eyebrow">Analyse nicht verfügbar</div><h2>Der Inhalt konnte gerade nicht verarbeitet werden.</h2></section>' +
      '<div class="error">' + esc(state.error) + '</div><div class="stack" style="margin-top:14px"><button class="btn block" data-action="retry-create">Nochmal versuchen</button><button class="btn secondary block" data-action="sample">Demo-Challenge öffnen</button></div>',
      true
    );
  }
}
function startChallenge(challenge) {
  state.challenge = challenge;
  state.qIndex = 0;
  state.score = 0;
  state.answered = false;
  state.lastCorrect = false;
  state.lastExplanation = '';
  state.loading = false;
  renderQuestion();
}
function renderQuestion() {
  const c = state.challenge;
  const q = c.questions[state.qIndex];
  state.view = 'question';
  let answers = '';
  if (q.choices && q.choices.length) {
    answers = '<div class="stack">' + q.choices.map(function (choice) {
      return '<button class="option" data-action="choice" data-value="' + esc(choice) + '">' + esc(choice) + '</button>';
    }).join('') + '</div>';
  } else {
    answers = '<div class="stack"><input id="answerInput" class="text-input" autocomplete="off" placeholder="Deine Antwort" /><button class="btn block" data-action="submit-answer">Antwort prüfen</button></div>';
  }
  const feedback = state.answered
    ? '<div class="feedback ' + (state.lastCorrect ? 'good' : 'bad') + '"><strong>' + (state.lastCorrect ? 'Richtig.' : 'Noch nicht.') + '</strong><br>' + esc(state.lastExplanation || '') + '</div><button class="btn block" style="margin-top:14px" data-action="next">' + (state.qIndex === c.questions.length - 1 ? 'Ergebnis ansehen' : 'Weiter') + '</button>'
    : '';
  app.innerHTML = shell(
    '<div class="section-head"><span class="pill brand">' + esc(c.topic) + '</span><span class="small">' + (state.qIndex + 1) + ' / ' + c.questions.length + '</span></div>' +
    '<div class="progress"><div style="width:' + (((state.qIndex + (state.answered ? 1 : 0)) / c.questions.length) * 100) + '%"></div></div>' +
    '<div class="question">' + esc(q.prompt) + '</div>' + (state.answered ? '' : answers) + feedback,
    false
  );
}
function answer(value) {
  if (state.answered) return;
  const q = state.challenge.questions[state.qIndex];
  state.lastCorrect = isCorrect(q, value);
  state.lastExplanation = q.explanation || (state.lastCorrect ? 'Passt.' : 'Vergleiche die Antwort noch einmal mit dem Lösungsweg.');
  state.answered = true;
  if (state.lastCorrect) state.score += 20;
  renderQuestion();
}
function nextQuestion() {
  if (state.qIndex >= state.challenge.questions.length - 1) {
    renderResult();
    return;
  }
  state.qIndex += 1;
  state.answered = false;
  state.lastCorrect = false;
  state.lastExplanation = '';
  renderQuestion();
}
function renderResult() {
  state.view = 'result';
  const score = Math.min(100, state.score);
  const p = saveResult(score);
  const label = score === 100 ? 'Perfekt.' : score >= 80 ? 'Sehr stark.' : score >= 60 ? 'Solide Basis.' : 'Nochmal lohnt sich.';
  app.innerHTML = shell(
    '<section class="hero center"><div class="eyebrow">Challenge beendet</div><h2>' + esc(label) + '</h2></section>' +
    '<div class="score"><strong>' + score + '%</strong></div>' +
    '<div class="card center"><strong>' + esc(state.challenge.title) + '</strong><p class="small">' + esc(state.challenge.topic) + ' · +' + score + ' XP · Streak ' + esc(p.streak) + '</p></div>' +
    '<div class="stack" style="margin-top:14px"><button class="btn block" data-action="share">Freund herausfordern</button><button class="btn secondary block" data-action="replay">Nochmal spielen</button><button class="btn ghost block" data-action="home">Zur Startseite</button></div>',
    false
  );
}
async function shareChallenge() {
  const compact = {
    version: state.challenge.version,
    title: state.challenge.title,
    topic: state.challenge.topic,
    source: state.challenge.source,
    questions: state.challenge.questions
  };
  const url = location.origin + location.pathname + '#challenge=' + encodeURIComponent(encodeChallenge(compact));
  const data = { title: 'SnapStudy Challenge', text: 'Schaffst du meine ' + state.score + '%? Versuch dieselbe Challenge.', url: url };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(url);
      alert('Challenge-Link kopiert.');
    }
  } catch (_) {}
}
function renderInvite(challenge) {
  state.invite = challenge;
  state.view = 'invite';
  app.innerHTML = shell(
    '<section class="hero"><div class="eyebrow">Challenge erhalten</div><h1>Du wurdest herausgefordert.</h1><p class="lead">' + esc(challenge.title) + ' · ' + esc(challenge.topic) + '</p></section>' +
    '<div class="card"><span class="pill brand">5 Fragen</span><p class="small" style="margin-bottom:0">Geteilte Challenges sind kostenlos und verbrauchen keine deiner drei täglichen Erstellungen.</p></div>' +
    '<div class="stack" style="margin-top:14px"><button class="btn block" data-action="start-invite">Challenge starten</button><button class="btn secondary block" data-action="home-clear">Eigene erstellen</button></div>',
    false
  );
}
function handleHash() {
  if (!location.hash.startsWith('#challenge=')) return false;
  try {
    const payload = decodeURIComponent(location.hash.slice('#challenge='.length));
    const challenge = decodeChallenge(payload);
    if (!challenge || !Array.isArray(challenge.questions) || challenge.questions.length < 1) throw new Error('invalid');
    renderInvite(challenge);
    return true;
  } catch (_) {
    history.replaceState(null, '', location.pathname);
    return false;
  }
}

app.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'home') renderHome();
  if (action === 'home-clear') { history.replaceState(null, '', location.pathname); renderHome(); }
  if (action === 'create') { state.file = null; state.preview = ''; state.error = ''; renderCreate(false); }
  if (action === 'create-text') { state.file = null; state.preview = ''; state.error = ''; renderCreate(true); }
  if (action === 'retry-create') renderCreate(false);
  if (action === 'analyze' && !state.loading) analyze();
  if (action === 'sample') startChallenge(challengeFromAnalysis(sampleAnalysis));
  if (action === 'choice') answer(button.dataset.value || button.textContent || '');
  if (action === 'submit-answer') {
    const input = document.getElementById('answerInput');
    if (input && input.value.trim()) answer(input.value);
  }
  if (action === 'next') nextQuestion();
  if (action === 'replay') startChallenge(state.challenge);
  if (action === 'share') shareChallenge();
  if (action === 'start-invite') startChallenge(state.invite);
  if (action === 'install' && deferredInstall) { deferredInstall.prompt(); deferredInstall = null; }
});
window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  deferredInstall = event;
});
window.addEventListener('hashchange', function () { if (!handleHash()) renderHome(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
if (!handleHash()) renderHome();
