// ===== Sidequests – Cyberpunk Edition =====
// v6: 12 tägliche Aufgaben + neue Stufe "super" (Pool-basiert)
// Verteilung: 4 easy, 4 med, 3 hard, 1 super
// Fixe: Gesamtzähler + UI, Reroll 1×/Tag, Mitternachts-Reset

const STORAGE_KEY = "sidequests_cyber_pool_v6";

/* Aufgaben-Katalog (easy/med/hard unverändert + erweitert) */
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
  { title:"Liegestütze: 3×10", detail:"auf Knien oder voll, 45s Pause", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:18 },
  { title:"Burpees light: 2×12", detail:"ohne Liegestütz, 45s Pause", cat:"Bewegung", diff:"med", time:"5 Min", xp:18 },
  { title:"Kniehebelauf: 3×45s", detail:"45s on / 30s off", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:15 },

  // Bewegung – SCHWER
  { title:"Zügig gehen/joggen: 1 km", detail:"Tempo: Gespräch möglich", cat:"Bewegung", diff:"hard", time:"10–15 Min", xp:30 },
  { title:"Intervall: 6×(30s schnell/30s locker)", detail:"2 Min Aufwärmen", cat:"Bewegung", diff:"hard", time:"12–14 Min", xp:32 },
  { title:"Treppen: 12–15 Stockwerke", detail:"hoch + runter zählen", cat:"Bewegung", diff:"hard", time:"10–15 Min", xp:34 },
  { title:"Tabata: 8 Runden 20/10", detail:"Air Squats & Mountain Climbers", cat:"Bewegung", diff:"hard", time:"4–6 Min", xp:30 },
  { title:"Gehen: 2 km zügig", detail:"durchziehen, wenig Pause", cat:"Bewegung", diff:"hard", time:"20–24 Min", xp:34 },
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
  { title:"Freewriting: 100 Wörter", detail:"ohne stoppen, Thema frei", cat:"Kreativität", diff:"med", time:"5–7 Min", xp:15 },
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
  { title:"Hotspot: 1 Zone", detail:"z.B. Schublade/Regalbrett", cat:"Ordnung", diff:"med", time:"5–7 Min", xp:20 },
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
  { title:"1 Glas Wasser trinken", detail:"bewusst, ohne Ablenkung", cat:"Ernährung", diff:"easy", time:"1 Min", xp:8 },
  { title:"1 Obstportion", detail:"z.B. Apfel/Banane", cat:"Ernährung", diff:"easy", time:"2 Min", xp:10 },
  { title:"Snack‑Check", detail:"1 zuckerigen Snack ersetzen", cat:"Ernährung", diff:"easy", time:"2–3 Min", xp:10 },

  // Ernährung – MITTEL
  { title:"Protein‑Check", detail:"1 proteinreiche Portion (z.B. Joghurt)", cat:"Ernährung", diff:"med", time:"5 Min", xp:15 },
  { title:"Mahlzeit planen", detail:"1 gesunde Mahlzeit für morgen", cat:"Ernährung", diff:"med", time:"5–7 Min", xp:15 },

  // Haushalt – LEICHT
  { title:"Spülzyklus kurz", detail:"5 Teller/Gläser spülen", cat:"Haushalt", diff:"easy", time:"5 Min", xp:10 },
  { title:"Boden: 2 m² kehren", detail:"kleine Fläche", cat:"Haushalt", diff:"easy", time:"4 Min", xp:10 },

  // Haushalt – MITTEL
  { title:"Wäsche: 1 Korb falten", detail:"nur falten + wegräumen", cat:"Haushalt", diff:"med", time:"10–12 Min", xp:18 },
  { title:"Bad: Waschbecken reinigen", detail:"inkl. Spiegel wischen", cat:"Haushalt", diff:"med", time:"8–10 Min", xp:18 },

  // Digital Detox – LEICHT
  { title:"Benachrichtigungen prüfen", detail:"1 App stummschalten", cat:"Digital Detox", diff:"easy", time:"3 Min", xp:10 },
  { title:"Homescreen aufräumen", detail:"2 Apps in Ordner verschieben", cat:"Digital Detox", diff:"easy", time:"3–4 Min", xp:10 },

  // Digital Detox – MITTEL
  { title:"Social Break: 10 Min", detail:"keine sozialen Medien", cat:"Digital Detox", diff:"med", time:"10 Min", xp:15 },
  { title:"Abos checken", detail:"1 unnötiges Abo kündigen", cat:"Digital Detox", diff:"med", time:"8–12 Min", xp:18 },

  // Finanzen – LEICHT
  { title:"1 Ausgabe notieren", detail:"Betrag + Kategorie", cat:"Finanzen", diff:"easy", time:"2 Min", xp:10 },
  { title:"Konto‑Check", detail:"Saldo prüfen, 1 Auffälligkeit notieren", cat:"Finanzen", diff:"easy", time:"3 Min", xp:10 },

  // Finanzen – MITTEL
  { title:"Budget 5 Min updaten", detail:"eine Kategorie anpassen", cat:"Finanzen", diff:"med", time:"5 Min", xp:15 },
  { title:"Sparziel definieren", detail:"1 Ziel + Monatsbetrag festlegen", cat:"Finanzen", diff:"med", time:"5–7 Min", xp:15 },

  // Sprache – LEICHT
  { title:"Vokabeln: 5 Wörter", detail:"mit 1 Beispielsatz", cat:"Sprache", diff:"easy", time:"5 Min", xp:10 },
  { title:"Aussprache: 2 Sätze laut", detail:"z.B. Podcast nachsprechen", cat:"Sprache", diff:"easy", time:"3–4 Min", xp:10 },

  // Sprache – MITTEL
  { title:"Mini‑Dialog schreiben", detail:"6 Zeilen, Alltagsthema", cat:"Sprache", diff:"med", time:"6–8 Min", xp:15 },
  { title:"Kurztext lesen", detail:"1 Absatz + 3 Fragen beantworten", cat:"Sprache", diff:"med", time:"8–10 Min", xp:18 },
];

/* Super-schwerer Pool (NEU) – 3–5 Aufgaben, 1 wird täglich gepickt */
const SUPER_POOL = [
  { title:"10 km zügig gehen/laufen", detail:"gutes Tempo, gleichmäßig; Aufwärmen + Cooldown", cat:"Bewegung", diff:"super", time:"60–80 Min", xp:90 },
  { title:"Treppen-Marathon: 60 Stockwerke", detail:"Pausen erlaubt, gleichmäßig zählen", cat:"Bewegung", diff:"super", time:"35–50 Min", xp:95 },
  { title:"EMOM 30 Min", detail:"Minute: 12 Pushups • Minute: 20 Air Squats (abwechselnd)", cat:"Bewegung", diff:"super", time:"30 Min", xp:92 },
  { title:"Digital Detox Hardcore", detail:"4 Stunden komplett offline (Flugmodus), vorab planen", cat:"Digital Detox", diff:"super", time:"240 Min", xp:90 },
  { title:"Deep Work Sprint", detail:"2×50 Min fokussiert mit 10 Min Pause (ohne Störungen)", cat:"Lernen", diff:"super", time:"110 Min", xp:88 }
];

/* Utils */
const $ = sel => document.querySelector(sel);
const now = () => new Date();
function todayKey(){ return new Date().toISOString().slice(0,10); }
function nextResetMidnight(){ const d = new Date(); d.setHours(24,0,0,0); return d; }
function pickRandomFrom(arr, n){
  const pool=[...arr], out=[];
  while(out.length<n && pool.length){
    const i = Math.floor(Math.random()*pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}
function pickOne(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function pad2(n){ return n<10 ? "0"+n : ""+n; }
function timeToHHMM(ms){
  if(ms<=0) return {h:"00", m:"00"};
  const tM = Math.floor(ms/60000);
  return { h: pad2(Math.floor(tM/60)), m: pad2(tM%60) };
}

/* State */
let state = loadState();
function defaultState(){
  return {
    xp: 0,
    level: 1,
    lastDay: todayKey(),
    resetAt: nextResetMidnight().toISOString(),
    rerolledForDay: false,
    quests: generateDailyQuestsCategorized(),
    totalDone: 0,
  };
}

/* Neue Tageslogik: 4 easy, 4 med, 3 hard, 1 super (Fallbacks) */
function generateDailyQuestsCategorized(){
  const easy = QUESTS.filter(q=>q.diff==="easy");
  const med  = QUESTS.filter(q=>q.diff==="med");
  const hard = QUESTS.filter(q=>q.diff==="hard");

  const needEasy = 4, needMed = 4, needHard = 3;

  let chosen = [
    ...pickRandomFrom(easy, Math.min(needEasy, easy.length)),
    ...pickRandomFrom(med,  Math.min(needMed,  med.length)),
  ];

  const hardTake = Math.min(needHard, hard.length);
  chosen = [...chosen, ...pickRandomFrom(hard, hardTake)];

  // Fallback: harte Slots mit mittel auffüllen
  if (hardTake < needHard) {
    const missing = needHard - hardTake;
    const medPool = med.filter(m => !chosen.includes(m));
    chosen = [...chosen, ...pickRandomFrom(medPool, Math.min(missing, medPool.length))];
  }

  // Super-Aufgabe (1 aus Pool)
  const superQuestRaw = pickOne(SUPER_POOL);
  const superQuest = { ...superQuestRaw };

  // IDs vergeben und Flags setzen
  chosen = chosen.map((q,i)=>({
    id: `${todayKey()}_${i}_${Math.random().toString(36).slice(2,6)}`,
    ...q, done:false, claimed:false
  }));

  const superId = `${todayKey()}_super_${Math.random().toString(36).slice(2,6)}`;
  const superWrapped = { id: superId, ...superQuest, done:false, claimed:false };

  // Sortierung: easy -> med -> hard -> super
  const weight = d => d==="easy"?1 : d==="med"?2 : d==="hard"?3 : d==="super"?4 : 5;

  const full = [...chosen, superWrapped].sort((a,b)=> weight(a.diff)-weight(b.diff));
  return full;
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);

    const r = s.resetAt ? new Date(s.resetAt) : nextResetMidnight();
    if(now() >= r){
      s.lastDay = todayKey();
      s.resetAt = nextResetMidnight().toISOString();
      s.quests = generateDailyQuestsCategorized();
      s.rerolledForDay = false;
    }

    s.xp = Math.max(0, Math.min(100, s.xp|0));
    s.level = Math.max(1, s.level|0);
    if(!Array.isArray(s.quests) || s.quests.length===0){
      s.quests = generateDailyQuestsCategorized();
    }
    if(typeof s.totalDone !== "number") s.totalDone = 0;

    return s;
  }catch(e){
    console.warn("State load error", e);
    return defaultState();
  }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* DOM refs */
const $xp = $("#xp");
const $levelValue = $("#levelValue");
const $levelCard = $("#levelCard");
const $resetH = $("#resetH");
const $resetM = $("#resetM");
const $tasksCount = $("#tasksCount");
const $questList = $("#questList");
const $reroll = $("#reroll");
const $audioClick = $("#uiClick");
const $xpFill = $("#xpFill");
const $nextLevelInfo = $("#nextLevelInfo");
const $totalDone = $("#totalDone");
const $totalDoneChip = $("#totalDoneChip");

/* Filter state */
let currentFilter = "all";

/* Render */
function renderStatus(){
  if($xp) $xp.textContent = `${state.xp} XP`;
  if($levelValue) $levelValue.textContent = state.level;

  if($xpFill) $xpFill.style.width = `${(state.xp/100)*100}%`;
  if($nextLevelInfo) $nextLevelInfo.textContent = `${state.xp}/100 XP bis Level ${state.level+1}`;

  const r = new Date(state.resetAt);
  const {h,m} = timeToHHMM(Math.max(0, r - now()));
  if($resetH) $resetH.textContent = h;
  if($resetM) $resetM.textContent = m;

  const total = state.quests.length;
  const done = state.quests.filter(q=>q.done && q.claimed).length;
  if($tasksCount) $tasksCount.textContent = `${done}/${total} abgeschlossen`;

  if($reroll){
    $reroll.disabled = !!state.rerolledForDay;
    $reroll.title = state.rerolledForDay ? "Reroll bereits genutzt (morgen wieder)" : "Neue Aufgaben (1×/Tag)";
  }

  if($totalDone) $totalDone.textContent = `${state.totalDone} gesamt`;
}
function diffBadge(diff){
  if(diff==="easy")  return `<span class="badge b-diff-easy"><span class="dot" style="background:#7bffc8"></span>Leicht</span>`;
  if(diff==="med")   return `<span class="badge b-diff-med"><span class="dot" style="background:#ffd86b"></span>Mittel</span>`;
  if(diff==="hard")  return `<span class="badge b-diff-hard"><span class="dot" style="background:#ff8cb8"></span>Schwer</span>`;
  return `<span class="badge b-diff-super"><span class="dot" style="background:#ff6ad5"></span>Super</span>`;
}
function taskRow(q){
  const dif = diffBadge(q.diff);
  const cat = `<span class="badge b-cat">#${q.cat}</span>`;
  const time = `<span class="badge b-cat">⏱ ${q.time}</span>`;
  const info = q.detail ? `<span class="badge b-cat">ℹ️ ${q.detail}</span>` : "";
  const action = !q.done
    ? `<button class="btn" data-act="done" data-id="${q.id}">Erledigt</button>`
    : (!q.claimed
      ? `<button class="btn btn-reroll" data-act="claim" data-id="${q.id}">+${q.xp} XP</button>`
      : `<span class="badge b-cat">✓ Abgeschlossen</span>`);
  return `
    <div class="task ${q.done?"done":""}">
      <div>
        <div class="task-title">${q.title}</div>
        <div class="task-sub">${dif}${cat}${time}${info}</div>
      </div>
      <div class="actions">${action}</div>
    </div>
  `;
}
function filteredQuests(){
  if(currentFilter==="todo") return state.quests.filter(q=>!q.done || (q.done && !q.claimed));
  if(currentFilter==="done") return state.quests.filter(q=>q.done && q.claimed);
  return state.quests;
}
function renderQuests(){
  const items = filteredQuests().map(taskRow).join("");
  if($questList) $questList.innerHTML = items || `<div class="muted small">Keine Aufgaben im aktuellen Filter.</div>`;
}
function renderAll(){ renderStatus(); renderQuests(); }
renderAll();

/* Interaktionen: Tasks */
if($questList){
  $questList.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    const act = btn.dataset.act;
    const id = btn.dataset.id;
    const q = state.quests.find(x=>x.id===id);
    if(!q) return;

    playClick();
    if(act==="done"){
      q.done = true;
      toast(`Erledigt: ${q.title}`, "success");
    }else if(act==="claim"){
      if(!q.done || q.claimed) return;
      q.claimed = true;

      state.totalDone = (state.totalDone || 0) + 1;

      if($totalDoneChip){
        $totalDoneChip.classList.remove("pulse");
        void $totalDoneChip.offsetWidth;
        $totalDoneChip.classList.add("pulse");
      }

      const beforeLevel = state.level;
      state.xp += q.xp;

      while(state.xp >= 100){
        state.xp -= 100;
        state.level += 1;
      }

      celebrate();
      toast(`+${q.xp} XP`, "success");

      if(state.level > beforeLevel){
        triggerLevelUpAnimation();
        toast(`Level ${state.level} erreicht!`, "success");
      }
    }
    saveState(); renderAll();
  });
}

/* Interaktionen: Filter */
document.querySelectorAll(".filter-btn").forEach(b=>{
  b.addEventListener("click", ()=>{
    document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    currentFilter = b.dataset.filter;
    playClick();
    renderQuests();
  });
});

/* Reroll 1× pro Tag */
if($reroll){
  $reroll.addEventListener("click", ()=>{
    if(state.rerolledForDay){
      toast("Reroll heute schon genutzt.", "warn");
      playClick();
      return;
    }
    playClick();
    state.quests = generateDailyQuestsCategorized();
    state.rerolledForDay = true;
    toast("Neue Aufgaben generiert.", "success");
    saveState(); renderAll();
  });
}

/* Reset & Timer */
function checkReset(){
  const r = new Date(state.resetAt);
  if(now() >= r){
    state.lastDay = todayKey();
    state.resetAt = nextResetMidnight().toISOString();
    state.quests = generateDailyQuestsCategorized();
    state.rerolledForDay = false;
    toast("Neuer Tag, neue Aufgaben!", "success");
    saveState(); renderAll();
  }else{
    renderStatus();
  }
}
setInterval(checkReset, 15_000);

/* Level-Up Animation */
function triggerLevelUpAnimation(){
  const $levelCard = document.getElementById("levelCard");
  if(!$levelCard) return;
  $levelCard.classList.remove("level-up");
  void $levelCard.offsetWidth;
  $levelCard.classList.add("level-up");
}

/* Cyber Effekte: Sound, Cursor-Glow, Hover-Partikel */
function playClick(){
  const a = document.getElementById("uiClick");
  if(!a) return;
  a.currentTime = 0;
  a.volume = 0.25;
  a.play().catch(()=>{});
}

/* Hover Particles */
const canvas = document.getElementById("hoverParticles");
const ctx = canvas ? canvas.getContext("2d") : null;
function resizeCanvas(){
  if(!canvas || !ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];
document.addEventListener("mousemove", (e)=>{
  if(!canvas || !ctx) return;
  for(let i=0;i<3;i++){
    particles.push({
      x:e.clientX, y:e.clientY,
      vx:(Math.random()-.5)*1.5, vy:(Math.random()-.5)*1.5,
      s: Math.random()*2+1, life: 30+Math.random()*20,
      col: Math.random()<.5 ? "#37f2e7" : "#b38aff"
    });
  }
});
(function tick(){
  if(!canvas || !ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x+=p.vx; p.y+=p.vy; p.life--; p.s*=0.98;
    ctx.fillStyle = p.col;
    ctx.globalAlpha = Math.max(0,p.life/60);
    ctx.fillRect(p.x, p.y, p.s, p.s);
    if(p.life<=0 || p.s<0.3) particles.splice(i,1);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
})();

/* UX: Toast & Confetti */
function toast(msg, type="info"){
  const el = document.createElement("div");
  Object.assign(el.style, {
    position:"fixed", left:"50%", bottom:"18px", transform:"translateX(-50%)",
    background: type==="success" ? "linear-gradient(135deg,#37f2e7,#b38aff)" :
               type==="warn" ? "linear-gradient(135deg,#ffd86b,#b38a2a)" :
               type==="danger" ? "linear-gradient(135deg,#ff6ad5,#8a1f6a)" :
                                 "linear-gradient(135deg,#b38aff,#6b4fd1)",
    color:"#070a10", padding:"10px 14px", borderRadius:"12px",
    fontWeight:"900", letterSpacing:".2px", zIndex:9999,
    boxShadow:"0 10px 30px rgba(0,0,0,.35)"
  });
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .35s"; }, 1500);
  setTimeout(()=> el.remove(), 2100);
}
function celebrate(){
  const c = document.createElement("canvas");
  c.width = window.innerWidth; c.height = window.innerHeight;
  Object.assign(c.style, { position:"fixed", inset:0, pointerEvents:"none", zIndex:9998 });
  document.body.appendChild(c);
  const ctx2 = c.getContext("2d");
  const N = 140;
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*c.width, y: -10,
    vx:(Math.random()-.5)*4, vy: Math.random()*2+2,
    s: Math.random()*3+2, life: Math.random()*60+40,
    col: Math.random()<.5 ? "#37f2e7" : "#b38aff"
  }));
  let f=0;
  (function tick2(){
    ctx2.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life--;
      ctx2.fillStyle=p.col; ctx2.fillRect(p.x,p.y,p.s,p.s);
    });
    f++;
    if(f<110) requestAnimationFrame(tick2); else c.remove();
  })();
}
