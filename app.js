// ===== Sidequests – Cyberpunk Edition =====
// Fix: "Gesamt erledigt" zählt zuverlässig + klarere Aufgaben
// - größerer Pool (präzise Anweisungen, besonders "Schwer")
// - tägliche Auswahl: 3 easy, 3 medium, 2 hard (Fallback falls nötig)
// - permanenter Zähler "Gesamt erledigt" (increment beim Einlösen +XP)
// - XP 0–100 pro Level, Level-Up-Animation
// - Reroll 1×/Tag, täglicher Reset um Mitternacht

const STORAGE_KEY = "sidequests_cyber_pool_v4";

/* Aufgaben-Katalog – erweitert und präzisiert */
const QUESTS = [
  // Bewegung – LEICHT
  { title:"Kniebeugen: 3×10", detail:"3 Sätze à 10 Wiederholungen, 30s Pause", cat:"Bewegung", diff:"easy", time:"5 Min", xp:10 },
  { title:"Wandsitz: 2×30s", detail:"Zwei Durchgänge, 30s Pause", cat:"Bewegung", diff:"easy", time:"3 Min", xp:10 },
  { title:"Jumping Jacks: 2×20", detail:"Zwei Durchgänge à 20, 20s Pause", cat:"Bewegung", diff:"easy", time:"3 Min", xp:10 },
  { title:"Gehen: 600 Schritte", detail:"Schrittzähler nutzen; ca. 5 Minuten", cat:"Bewegung", diff:"easy", time:"5 Min", xp:10 },
  { title:"Mobilisieren: Schultern 2×20 Kreise", detail:"Vorwärts & rückwärts je 20", cat:"Bewegung", diff:"easy", time:"3 Min", xp:8 },

  // Bewegung – MITTEL
  { title:"Plank: 3×30s", detail:"Ellenbogenstütz, 30s Pause", cat:"Bewegung", diff:"med", time:"5 Min", xp:15 },
  { title:"Ausfallschritte: 3×12 (gesamt)", detail:"Je Bein 6 Wdh., 45s Pause", cat:"Bewegung", diff:"med", time:"6 Min", xp:18 },
  { title:"Liegestütze: 3×10", detail:"Auf Knien oder voll, 45s Pause", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:18 },
  { title:"Burpees light: 2×12", detail:"Ohne Liegestütz, 45s Pause", cat:"Bewegung", diff:"med", time:"5 Min", xp:18 },
  { title:"Kniehebelauf: 3×45s", detail:"45s on / 30s off", cat:"Bewegung", diff:"med", time:"6–7 Min", xp:15 },

  // Bewegung – SCHWER
  { title:"Zügig gehen/joggen: 1 km", detail:"Tempo so, dass du sprechen kannst", cat:"Bewegung", diff:"hard", time:"10–15 Min", xp:30 },
  { title:"Intervalle: 6×(30s schnell/30s locker)", detail:"Start mit Aufwärmen 2 Min", cat:"Bewegung", diff:"hard", time:"12–14 Min", xp:32 },
  { title:"Treppen: 10 Stockwerke gesamt", detail:"Auf- und abwärts zählen", cat:"Bewegung", diff:"hard", time:"10–12 Min", xp:32 },
  { title:"Tabata Ganzkörper: 8 Runden 20/10", detail:"Air Squats & Mountain Climbers", cat:"Bewegung", diff:"hard", time:"4–6 Min", xp:30 },
  { title:"Gehen: 2 km zügig", detail:"Durchziehen ohne lange Pause", cat:"Bewegung", diff:"hard", time:"20–24 Min", xp:34 },
  { title:"Kraftzirkel: 4 Runden", detail:"15 Squats + 10 Pushups + 20 JJ", cat:"Bewegung", diff:"hard", time:"12–15 Min", xp:34 },

  // Achtsamkeit – LEICHT
  { title:"Atemfokus: 1 Minute", detail:"4s ein – 4s aus", cat:"Achtsamkeit", diff:"easy", time:"1 Min", xp:10 },
  { title:"Dankbarkeit: 3 Notizen", detail:"3 konkrete, heutige Dinge", cat:"Achtsamkeit", diff:"easy", time:"3 Min", xp:10 },
  { title:"Body-Scan: 45s", detail:"Von Kopf bis Fuß, langsam", cat:"Achtsamkeit", diff:"easy", time:"1–2 Min", xp:10 },

  // Achtsamkeit – MITTEL
  { title:"Digital Detox: 5 Minuten", detail:"Handy weg, Blick aus dem Fenster", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },
  { title:"Box-Breathing: 2×(4‑4‑4‑4)", detail:"Ein‑halten‑aus‑halten", cat:"Achtsamkeit", diff:"med", time:"3–4 Min", xp:15 },
  { title:"Mini‑Meditation: 1 Session", detail:"App/Video ≤5 Min", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },

  // Kreativität – LEICHT
  { title:"Doodle: 3 kleine Skizzen", detail:"3 Objekte in 3 Minuten", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },
  { title:"Zwei‑Zeiler dichten", detail:"Reim mit einem Alltagsding", cat:"Kreativität", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"Foto-Challenge: Farbe Blau", detail:"1 Motiv in Blau", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },

  // Kreativität – MITTEL
  { title:"Freewriting: 70 Wörter", detail:"Ohne Stoppen, Thema frei", cat:"Kreativität", diff:"med", time:"5 Min", xp:15 },
  { title:"Logo‑Skizzen: 3 Varianten", detail:"5 Minuten Timer", cat:"Kreativität", diff:"med", time:"5 Min", xp:15 },

  // Soziales – LEICHT
  { title:"Nette Nachricht senden", detail:"Kurzer Check‑in an jemanden", cat:"Soziales", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"Dank aussprechen", detail:"Eine konkrete Person, ein Anlass", cat:"Soziales", diff:"easy", time:"2 Min", xp:10 },

  // Soziales – MITTEL
  { title:"Kurz telefonieren", detail:"2–5 Minuten Smalltalk", cat:"Soziales", diff:"med", time:"5 Min", xp:18 },
  { title:"Mini‑Treffen planen", detail:"Termin vorschlagen + 1 Option", cat:"Soziales", diff:"med", time:"5 Min", xp:15 },

  // Ordnung – LEICHT
  { title:"Mülleimer leeren", detail:"Küche oder Zimmer", cat:"Ordnung", diff:"easy", time:"2 Min", xp:8 },
  { title:"Schreibtisch wischen", detail:"Fläche freiräumen, wischen", cat:"Ordnung", diff:"easy", time:"3 Min", xp:10 },

  // Ordnung – MITTEL
  { title:"Hotspot aufräumen: 1 Zone", detail:"z.B. Schublade/Regalbrett", cat:"Ordnung", diff:"med", time:"5–7 Min", xp:20 },
  { title:"E‑Mail: 10 Mails verarbeiten", detail:"Löschen/Archivieren/Antworten", cat:"Ordnung", diff:"med", time:"5–7 Min", xp:15 },

  // Lernen – LEICHT
  { title:"1 neues Wort lernen", detail:"Definition & Beispiel", cat:"Lernen", diff:"easy", time:"2–3 Min", xp:10 },
  { title:"1 Absatz lesen", detail:"Kernaussage notieren", cat:"Lernen", diff:"easy", time:"3 Min", xp:10 },

  // Lernen – MITTEL
  { title:"Karteikarten: 5 Stück wiederholen", detail:"Aktives Recall", cat:"Lernen", diff:"med", time:"4–6 Min", xp:15 },
  { title:"Erklärvideo ≤5 Min", detail:"1 Erkenntnis notieren", cat:"Lernen", diff:"med", time:"5 Min", xp:15 },

  // Spaß – LEICHT
  { title:"Freestyle‑Tanz: 20s", detail:"Musik an, bewegen", cat:"Spaß", diff:"easy", time:"1 Min", xp:10 },
  { title:"Absurder Superhelden‑Name", detail:"Figur + Fähigkeit erfinden", cat:"Spaß", diff:"easy", time:"2 Min", xp:10 },

  // Spaß – MITTEL
  { title:"Mini‑Rätsel lösen", detail:"Sudoku/KenKen/Wordle", cat:"Spaß", diff:"med", time:"5 Min", xp:15 },
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
    xp: 0,                // XP innerhalb des aktuellen Levels (0–100)
    level: 1,             // aktuelles Level
    lastDay: todayKey(),
    resetAt: nextResetMidnight().toISOString(),
    rerolledForDay: false, // 1×/Tag-Limit
    quests: generateDailyQuestsCategorized(),
    totalDone: 0,         // Gesamt erledigte Aufgaben (persistent)
  };
}

/* Generiert 3 easy, 3 med, 2 hard – robust */
function generateDailyQuestsCategorized(){
  const easy = QUESTS.filter(q=>q.diff==="easy");
  const med  = QUESTS.filter(q=>q.diff==="med");
  const hard = QUESTS.filter(q=>q.diff==="hard");

  const needEasy = 3, needMed = 3, needHard = 2;

  let chosen = [
    ...pickRandomFrom(easy, Math.min(needEasy, easy.length)),
    ...pickRandomFrom(med, Math.min(needMed, med.length)),
  ];

  const hardTake = Math.min(needHard, hard.length);
  chosen = [...chosen, ...pickRandomFrom(hard, hardTake)];

  // Fallback: falls hard < 2, mit med auffüllen
  if (hardTake < needHard) {
    const missing = needHard - hardTake;
    const medPool = med.filter(m => !chosen.includes(m));
    chosen = [...chosen, ...pickRandomFrom(medPool, Math.min(missing, medPool.length))];
  }

  chosen = chosen.map((q,i)=>({
    id: `${todayKey()}_${i}_${Math.random().toString(36).slice(2,6)}`,
    ...q, done:false, claimed:false
  }));

  // Sortierung: easy -> med -> hard
  const w = d => d==="easy"?1: d==="med"?2: 3;
  chosen.sort((a,b)=> w(a.diff)-w(b.diff));
  return chosen;
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

    // Safety/Defaults
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

/* DOM refs (defensiv) */
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
  if(diff==="easy") return `<span class="badge b-diff-easy"><span class="dot" style="background:#7bffc8"></span>Leicht</span>`;
  if(diff==="med")  return `<span class="badge b-diff-med"><span class="dot" style="background:#ffd86b"></span>Mittel</span>`;
  return `<span class="badge b-diff-hard"><span class="dot" style="background:#ff8cb8"></span>Schwer</span>`;
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

      // Gesamtzähler hochzählen
      state.totalDone = (state.totalDone || 0) + 1;

      // Pulse-Animation auf dem Chip
      if($totalDoneChip){
        $totalDoneChip.classList.remove("pulse");
        void $totalDoneChip.offsetWidth;
        $totalDoneChip.classList.add("pulse");
      }

      const beforeLevel = state.level;
      state.xp += q.xp;

      // Level-Up Logik mit XP-Reset pro Level (100 XP pro Stufe)
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
  if(!$levelCard) return;
  $levelCard.classList.remove("level-up");
  void $levelCard.offsetWidth; // reflow
  $levelCard.classList.add("level-up");
}

/* Cyber Effekte: Sound, Cursor-Glow, Hover-Partikel */
function playClick(){
  const a = $audioClick;
  if(!a) return;
  a.currentTime = 0;
  a.volume = 0.25;
  a.play().catch(()=>{});
}

/* Hover Particles */
const canvas = document.getElementById("hoverParticles");
const ctx = canvas.getContext("2d");
function resizeCanvas(){
  if(!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];
document.addEventListener("mousemove", (e)=>{
  if(!canvas) return;
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
  if(!canvas) return;
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
