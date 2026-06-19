// Sidequests – 12 Aufgaben + „super“-Stufe mit progressivem Levelsystem
// Verteilung: 4 leicht, 4 mittel, 3 schwer, 1 super (aus Pool)

const STORAGE_KEY = "sidequests_daily_progressive_v1";

/* XP-Kurve: benötigte XP für den Sprung von `level` zu `level+1`
   Standard: 100, 150, 200, ... (Zuwachs +50 pro Level) */
function xpRequiredFor(level){
  // level >= 1
  return 100 + (level - 1) * 50;
}

/* Aufgaben-Katalog */
const QUESTS = [
  // Bewegung – LEICHT
  { title:"Kniebeugen: 3×10", detail:"3 Sätze à 10, 30s Pause", cat:"Bewegung", diff:"easy", time:"5 Min", xp:10 },
  { title:"Wandsitz: 2×30s", detail:"Zwei Durchgänge, 30s Pause", cat:"Bewegung", diff:"easy", time:"3 Min", xp:10 },
  { title:"Jumping Jacks: 2×20", detail:"2×20, 20s Pause", cat:"Bewegung", diff:"easy", time:"3 Min", xp:10 },
  { title:"Gehen: 600 Schritte", detail:"Schrittzähler; ca. 5 Minuten", cat:"Bewegung", diff:"easy", time:"5 Min", xp:10 },
  { title:"Schultern: 2×20 Kreise", detail:"vorwärts & rückwärts", cat:"Bewegung", diff:"easy", time:"3 Min", xp:8 },

  // Bewegung – MITTEL
  { title:"Plank: 3×30s", detail:"Ellenbogenstütz, 30s Pause", cat:"Bewegung", diff:"med", time:"5 Min", xp:15 },
  { title:"Ausfallschritte: 3×12 (gesamt)", detail:"je Bein 6, 45s Pause", cat:"Bewegung", diff:"med", time:"6 Min", xp:18 },
  { title:"Liegestütze: 3×10", detail:"Knie‑ oder volle Variante", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:18 },
  { title:"Burpees light: 2×12", detail:"ohne Liegestütz", cat:"Bewegung", diff:"med", time:"5 Min", xp:18 },
  { title:"Kniehebelauf: 3×45s", detail:"45s on / 30s off", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:15 },

  // Bewegung – SCHWER
  { title:"Zügig gehen/joggen: 1 km", detail:"Tempo: Gespräch möglich", cat:"Bewegung", diff:"hard", time:"10–15 Min", xp:30 },
  { title:"Intervall: 6×(30s schnell/30s locker)", detail:"2 Min Warmup", cat:"Bewegung", diff:"hard", time:"12–14 Min", xp:32 },
  { title:"Treppen: 12–15 Stockwerke", detail:"hoch + runter zählen", cat:"Bewegung", diff:"hard", time:"10–15 Min", xp:34 },
  { title:"Tabata: 8 Runden 20/10", detail:"Air Squats & Mountain Climbers", cat:"Bewegung", diff:"hard", time:"4–6 Min", xp:30 },
  { title:"Gehen: 2 km zügig", detail:"wenig Pause", cat:"Bewegung", diff:"hard", time:"20–24 Min", xp:34 },
  { title:"Kraftzirkel: 4 Runden", detail:"15 Squats + 10 Pushups + 20 JJ", cat:"Bewegung", diff:"hard", time:"12–15 Min", xp:34 },

  // Achtsamkeit – LEICHT
  { title:"Atemfokus: 1 Minute", detail:"4s ein – 4s aus", cat:"Achtsamkeit", diff:"easy", time:"1 Min", xp:10 },
  { title:"Dankbarkeit: 3 Notizen", detail:"heute, konkret", cat:"Achtsamkeit", diff:"easy", time:"3 Min", xp:10 },
  { title:"Body-Scan: 45s", detail:"Kopf → Fuß, langsam", cat:"Achtsamkeit", diff:"easy", time:"1–2 Min", xp:10 },

  // Achtsamkeit – MITTEL
  { title:"Digitaler Abstand: 5 Min", detail:"kein Screen, Blick raus", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },
  { title:"Box-Breathing: 2×(4‑4‑4‑4)", detail:"ein‑halten‑aus‑halten", cat:"Achtsamkeit", diff:"med", time:"3–4 Min", xp:15 },
  { title:"Mini‑Meditation: 1 Session", detail:"App/Video ≤5 Min", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },

  // Kreativität – LEICHT
  { title:"Doodle: 3 Skizzen", detail:"3 Objekte in 3 Min", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },
  { title:"Zwei‑Zeiler dichten", detail:"Reim + Alltagsding", cat:"Kreativität", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"Foto: Farbe Blau", detail:"1 Motiv", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },

  // Kreativität – MITTEL
  { title:"Freewriting: 100 Wörter", detail:"ohne stoppen", cat:"Kreativität", diff:"med", time:"5–7 Min", xp:15 },
  { title:"Logo‑Skizzen: 5 Varianten", detail:"5 Minuten Timer", cat:"Kreativität", diff:"med", time:"5 Min", xp:15 },

  // Soziales – LEICHT
  { title:"Nette Nachricht senden", detail:"kurzer Check‑in", cat:"Soziales", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"Dank aussprechen", detail:"Person + Anlass", cat:"Soziales", diff:"easy", time:"2 Min", xp:10 },

  // Soziales – MITTEL
  { title:"Kurz telefonieren", detail:"2–5 Minuten", cat:"Soziales", diff:"med", time:"5 Min", xp:18 },
  { title:"Mini‑Treffen planen", detail:"Zeitfenster + Ort", cat:"Soziales", diff:"med", time:"5 Min", xp:15 },

  // Ordnung – LEICHT
  { title:"Mülleimer leeren", detail:"Küche/Zimmer", cat:"Ordnung", diff:"easy", time:"2 Min", xp:8 },
  { title:"Schreibtisch wischen", detail:"Fläche freiräumen", cat:"Ordnung", diff:"easy", time:"3 Min", xp:10 },

  // Ordnung – MITTEL
  { title:"Hotspot: 1 Zone", detail:"Schublade/Regalbrett", cat:"Ordnung", diff:"med", time:"5–7 Min", xp:20 },
  { title:"E‑Mail: 10 Mails verarbeiten", detail:"löschen/archivieren/antworten", cat:"Ordnung", diff:"med", time:"5–7 Min", xp:15 },

  // Lernen – LEICHT
  { title:"1 neues Wort", detail:"Definition + Beispiel", cat:"Lernen", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"1 Absatz lesen", detail:"Kernaussage notieren", cat:"Lernen", diff:"easy", time:"3 Min", xp:10 },

  // Lernen – MITTEL
  { title:"Karteikarten: 5 wiederholen", detail:"aktives Recall", cat:"Lernen", diff:"med", time:"4–6 Min", xp:15 },
  { title:"Erklärvideo ≤5 Min", detail:"1 Erkenntnis notieren", cat:"Lernen", diff:"med", time:"5 Min", xp:15 },

  // Spaß – LEICHT
  { title:"Freestyle‑Tanz: 20s", detail:"Musik an, bewegen", cat:"Spaß", diff:"easy", time:"1 Min", xp:10 },
  { title:"1‑Satz‑Witz schreiben", detail:"Thema: Tier", cat:"Spaß", diff:"easy", time:"2 Min", xp:10 },

  // Spaß – MITTEL
  { title:"Mini‑Rätsel lösen", detail:"Sudoku/Nonogramm ≤10 Min", cat:"Spaß", diff:"med", time:"5–10 Min", xp:15 },

  // Ernährung – LEICHT
  { title:"1 Glas Wasser", detail:"bewusst trinken", cat:"Ernährung", diff:"easy", time:"1 Min", xp:8 },
  { title:"1 Obstportion", detail:"z.B. Apfel/Banane", cat:"Ernährung", diff:"easy", time:"2 Min", xp:10 },
  { title:"Snack‑Check", detail:"zuckerigen Snack ersetzen", cat:"Ernährung", diff:"easy", time:"2–3 Min", xp:10 },

  // Ernährung – MITTEL
  { title:"Protein‑Check", detail:"z.B. Joghurt/Tofu", cat:"Ernährung", diff:"med", time:"5 Min", xp:15 },
  { title:"Mahlzeit planen", detail:"für morgen", cat:"Ernährung", diff:"med", time:"5–7 Min", xp:15 },

  // Haushalt – LEICHT
  { title:"Spülzyklus kurz", detail:"5 Teller/Gläser", cat:"Haushalt", diff:"easy", time:"5 Min", xp:10 },
  { title:"Boden: 2 m² kehren", detail:"kleine Fläche", cat:"Haushalt", diff:"easy", time:"4 Min", xp:10 },

  // Haushalt – MITTEL
  { title:"Wäsche: 1 Korb falten", detail:"falten + wegräumen", cat:"Haushalt", diff:"med", time:"10–12 Min", xp:18 },
  { title:"Bad: Waschbecken reinigen", detail:"inkl. Spiegel", cat:"Haushalt", diff:"med", time:"8–10 Min", xp:18 },

  // Digital Detox – LEICHT
  { title:"Benachrichtigungen prüfen", detail:"1 App stummschalten", cat:"Digital Detox", diff:"easy", time:"3 Min", xp:10 },
  { title:"Homescreen aufräumen", detail:"2 Apps verschieben", cat:"Digital Detox", diff:"easy", time:"3–4 Min", xp:10 },

  // Digital Detox – MITTEL
  { title:"Social Break: 10 Min", detail:"ohne soziale Medien", cat:"Digital Detox", diff:"med", time:"10 Min", xp:15 },
  { title:"Abos checken", detail:"1 unnötiges Abo kündigen", cat:"Digital Detox", diff:"med", time:"8–12 Min", xp:18 },

  // Finanzen – LEICHT
  { title:"1 Ausgabe notieren", detail:"Betrag + Kategorie", cat:"Finanzen", diff:"easy", time:"2 Min", xp:10 },
  { title:"Konto‑Check", detail:"Saldo prüfen", cat:"Finanzen", diff:"easy", time:"3 Min", xp:10 },

  // Finanzen – MITTEL
  { title:"Budget 5 Min updaten", detail:"1 Kategorie anpassen", cat:"Finanzen", diff:"med", time:"5 Min", xp:15 },
  { title:"Sparziel definieren", detail:"Ziel + Monatsbetrag", cat:"Finanzen", diff:"med", time:"5–7 Min", xp:15 },

  // Sprache – LEICHT
  { title:"Vokabeln: 5 Wörter", detail:"+ Beispielsatz", cat:"Sprache", diff:"easy", time:"5 Min", xp:10 },
  { title:"Aussprache: 2 Sätze laut", detail:"nachsprechen", cat:"Sprache", diff:"easy", time:"3–4 Min", xp:10 },

  // Sprache – MITTEL
  { title:"Mini‑Dialog schreiben", detail:"6 Zeilen", cat:"Sprache", diff:"med", time:"6–8 Min", xp:15 },
  { title:"Kurztext lesen", detail:"Absatz + 3 Fragen", cat:"Sprache", diff:"med", time:"8–10 Min", xp:18 },
];

/* Super‑Pool: 1 pro Tag zufällig */
const SUPER_POOL = [
  { title:"10 km zügig gehen/laufen", detail:"Aufwärmen + Cooldown", cat:"Bewegung", diff:"super", time:"60–80 Min", xp:90 },
  { title:"Treppen‑Marathon: 60 Stockwerke", detail:"Pausen erlaubt", cat:"Bewegung", diff:"super", time:"35–50 Min", xp:95 },
  { title:"EMOM 30 Min", detail:"Min1: 12 Pushups • Min2: 20 Air Squats", cat:"Bewegung", diff:"super", time:"30 Min", xp:92 },
  { title:"Digital Detox Hardcore", detail:"4 Stunden Flugmodus", cat:"Digital Detox", diff:"super", time:"240 Min", xp:90 },
  { title:"Deep Work Sprint", detail:"2×50 Min Fokus, 10 Min Pause", cat:"Lernen", diff:"super", time:"110 Min", xp:88 },
];

/* Utils */
const $ = sel => document.querySelector(sel);
const now = () => new Date();
const todayKey = () => new Date().toISOString().slice(0,10);
const nextMidnight = () => { const d=new Date(); d.setHours(24,0,0,0); return d; };
const pad2 = n => n<10 ? "0"+n : ""+n;

function pickRandom(arr, n){
  const pool=[...arr], out=[];
  while(out.length<n && pool.length){
    const i=Math.floor(Math.random()*pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}
const pickOne = arr => arr[Math.floor(Math.random()*arr.length)];

/* State */
let state = loadState();
function defaultState(){
  const level = 1;
  const req = xpRequiredFor(level);
  return {
    level,
    xpTowardsLevel: 0,            // XP innerhalb des aktuellen Levels
    requiredForLevel: req,        // benötigte XP für nächsten Aufstieg
    lastDay: todayKey(),
    resetAt: nextMidnight().toISOString(),
    rerolled: false,
    quests: generateDaily(),
    totalDone: 0
  };
}

/* 12 Aufgaben/Tag: 4 easy, 4 med, 3 hard, 1 super */
function generateDaily(){
  const easy = QUESTS.filter(q=>q.diff==="easy");
  const med  = QUESTS.filter(q=>q.diff==="med");
  const hard = QUESTS.filter(q=>q.diff==="hard");
  const need = { easy:4, med:4, hard:3 };

  let chosen = [
    ...pickRandom(easy, Math.min(need.easy, easy.length)),
    ...pickRandom(med,  Math.min(need.med,  med.length)),
  ];

  const hardTake = Math.min(need.hard, hard.length);
  chosen.push(...pickRandom(hard, hardTake));

  // Fallbacks, falls "hard" knapp
  if(hardTake < need.hard){
    const miss = need.hard - hardTake;
    const medPool = med.filter(m => !chosen.includes(m));
    chosen.push(...pickRandom(medPool, Math.min(miss, medPool.length)));
  }

  // Super (1 aus Pool)
  const superRaw = pickOne(SUPER_POOL);
  const superQuest = { ...superRaw };

  // IDs + Flags
  chosen = chosen.map((q,i)=>({
    id: `${todayKey()}_${i}_${Math.random().toString(36).slice(2,6)}`,
    ...q, done:false, claimed:false
  }));
  const superId = `${todayKey()}_super_${Math.random().toString(36).slice(2,6)}`;
  const superWrapped = { id: superId, ...superQuest, done:false, claimed:false };

  const weight = d => d==="easy"?1 : d==="med"?2 : d==="hard"?3 : d==="super"?4 : 5;
  return [...chosen, superWrapped].sort((a,b)=> weight(a.diff)-weight(b.diff));
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);

    // Reset-Check
    const r = s.resetAt ? new Date(s.resetAt) : nextMidnight();
    if(now() >= r){
      s.lastDay = todayKey();
      s.resetAt = nextMidnight().toISOString();
      s.quests = generateDaily();
      s.rerolled = false;
    }

    // Progressive XP Felder migrieren, falls aus alter Version
    if(typeof s.xpTowardsLevel !== "number"){
      // Falls alte 'xp' existiert, als innerhalb Level interpretieren (Cap auf aktuelles req)
      const lv = Math.max(1, s.level || 1);
      const req = xpRequiredFor(lv);
      const oldXp = Math.max(0, Math.min(req, (s.xp|0) || 0));
      s.xpTowardsLevel = oldXp;
      s.requiredForLevel = req;
      delete s.xp;
    }
    if(typeof s.requiredForLevel !== "number"){
      s.requiredForLevel = xpRequiredFor(Math.max(1, s.level || 1));
    }
    if(typeof s.level !== "number") s.level = 1;
    if(!Array.isArray(s.quests) || s.quests.length===0) s.quests = generateDaily();
    if(typeof s.totalDone !== "number") s.totalDone = 0;

    return s;
  }catch(e){
    console.warn("loadState", e);
    return defaultState();
  }
}
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

/* DOM */
const xpBar = $("#xpBar");
const xpText = $("#xpText");
const levelValue = $("#levelValue");
const nextLevelInfo = $("#nextLevelInfo");
const resetH = $("#resetH");
const resetM = $("#resetM");
const rerollBtn = $("#rerollBtn");
const listEl = $("#list");
const tasksCounter = $("#tasksCounter");
const doneText = $("#doneText");

/* Filter */
let currentFilter = "all";

/* Render */
function diffLabel(d){
  if(d==="easy") return "Leicht";
  if(d==="med")  return "Mittel";
  if(d==="hard") return "Schwer";
  return "Super";
}
function diffClass(d){
  if(d==="easy") return "b-easy";
  if(d==="med") return "b-med";
  if(d==="hard") return "b-hard";
  return "b-super";
}
function badgeDiff(d){
  const c = diffClass(d);
  const col = d==="easy"?"#7bffc8": d==="med"?"#ffd86b": d==="hard"?"#ff8cb8":"#ff6ad5";
  return `<span class="badge ${c}"><span class="dot" style="background:${col}"></span>${diffLabel(d)}</span>`;
}

function taskItem(q){
  const diff = badgeDiff(q.diff);
  const cat = `<span class="badge">#${q.cat}</span>`;
  const time = `<span class="badge">⏱ ${q.time}</span>`;
  const info = q.detail ? `<span class="badge">ℹ️ ${q.detail}</span>` : "";
  const action = !q.done
    ? `<button class="btn" data-act="done" data-id="${q.id}">Erledigt</button>`
    : (!q.claimed
      ? `<button class="btn btn-primary" data-act="claim" data-id="${q.id}">+${q.xp} XP</button>`
      : `<span class="badge">✓ Abgeschlossen</span>`);
  return `
    <div class="task ${q.done?"done":""}">
      <div>
        <div class="task-title">${q.title}</div>
        <div class="task-sub">${diff}${cat}${time}${info}</div>
      </div>
      <div>${action}</div>
    </div>
  `;
}

function filteredQuests(){
  if(currentFilter==="todo") return state.quests.filter(q=>!q.done || (q.done && !q.claimed));
  if(currentFilter==="done") return state.quests.filter(q=>q.done && q.claimed);
  return state.quests;
}

function renderStatus(){
  const req = state.requiredForLevel;
  const cur = state.xpTowardsLevel;
  xpText.textContent = `${cur}/${req} XP`;
  levelValue.textContent = state.level;
  xpBar.style.width = `${Math.min(100, (cur/req)*100)}%`;
  nextLevelInfo.textContent = `${cur}/${req} XP bis Level ${state.level+1}`;

  const r = new Date(state.resetAt);
  const ms = Math.max(0, r - now());
  const m = Math.floor(ms/60000);
  resetH.textContent = pad2(Math.floor(m/60));
  resetM.textContent = pad2(m%60);

  const total = state.quests.length;
  const done = state.quests.filter(q=>q.done && q.claimed).length;
  tasksCounter.textContent = `${done}/${total} abgeschlossen`;
  doneText.textContent = `${state.totalDone} gesamt`;

  rerollBtn.disabled = !!state.rerolled;
  rerollBtn.title = state.rerolled ? "Reroll genutzt (morgen wieder)" : "Neue Aufgaben (1×/Tag)";
}

function renderList(){
  const items = filteredQuests().map(taskItem).join("");
  listEl.innerHTML = items || `<div class="muted small">Keine Aufgaben im aktuellen Filter.</div>`;
}
function renderAll(){ renderStatus(); renderList(); }
renderAll();

/* Interaktionen */
document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderList();
  });
});

listEl.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  const q = state.quests.find(x=>x.id===id);
  if(!q) return;

  if(act==="done"){
    q.done = true;
    toast(`Erledigt: ${q.title}`);
  }else if(act==="claim"){
    if(!q.done || q.claimed) return;
    q.claimed = true;
    state.totalDone = (state.totalDone||0) + 1;

    // Progressive XP-Zuweisung
    addXp(q.xp);
    toast(`+${q.xp} XP`);
  }
  saveState(); renderAll();
});

rerollBtn.addEventListener("click", ()=>{
  if(state.rerolled){
    toast("Reroll heute schon genutzt.", "warn");
    return;
  }
  state.quests = generateDaily();
  state.rerolled = true;
  toast("Neue Aufgaben generiert.");
  saveState(); renderAll();
});

/* Timer für Tages-Reset (alle 15s) */
setInterval(()=>{
  const r = new Date(state.resetAt);
  if(now() >= r){
    state.lastDay = todayKey();
    state.resetAt = nextMidnight().toISOString();
    state.quests = generateDaily();
    state.rerolled = false;
    toast("Neuer Tag, neue Aufgaben!");
    saveState(); renderAll();
  }else{
    renderStatus();
  }
}, 15000);

/* XP/Level-Logik mit progressiver Anforderung */
function addXp(amount){
  let remaining = amount;
  while(remaining > 0){
    const need = state.requiredForLevel - state.xpTowardsLevel;
    if(remaining >= need){
      // Level-Up
      remaining -= need;
      state.level += 1;
      state.xpTowardsLevel = 0;
      state.requiredForLevel = xpRequiredFor(state.level);
      toast(`Level ${state.level} erreicht!`);
    }else{
      state.xpTowardsLevel += remaining;
      remaining = 0;
    }
  }
}

/* Toast */
function toast(msg, type="info"){
  const box = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = "toast" + (type==="warn" ? " warn" : type==="error" ? " error" : "");
  el.textContent = msg;
  box.appendChild(el);
  requestAnimationFrame(()=> el.style.opacity = "1");
  setTimeout(()=> {
    el.style.transition = "opacity .3s";
    el.style.opacity = "0";
  }, 1600);
  setTimeout(()=> el.remove(), 1950);
}

/* Debug-Hinweis */
console.log("Sidequests (progressiv) bereit. Für Neustart: localStorage.removeItem('%s')", STORAGE_KEY);
