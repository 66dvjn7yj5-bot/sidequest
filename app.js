// ===== Sidequests – Cyberpunk Edition (größerer Aufgabenpool + 2× hard garantiert) =====

const STORAGE_KEY = "sidequests_cyber_pool_v2";

/* Aufgaben-Katalog – deutlich erweitert */
const QUESTS = [
  // Bewegung – easy
  { title:"20 Kniebeugen", cat:"Bewegung", diff:"easy", time:"2 Min", xp:10 },
  { title:"15 Ausfallschritte (gesamt)", cat:"Bewegung", diff:"easy", time:"3 Min", xp:10 },
  { title:"30 Sekunden Wandsitz", cat:"Bewegung", diff:"easy", time:"1 Min", xp:10 },
  { title:"20 Jumping Jacks", cat:"Bewegung", diff:"easy", time:"2 Min", xp:10 },

  // Bewegung – medium
  { title:"30‑Sekunden Plank", cat:"Bewegung", diff:"med", time:"1 Min", xp:15 },
  { title:"3×10 Sekunden Dehnen (Beine)", cat:"Bewegung", diff:"med", time:"3 Min", xp:15 },
  { title:"15 Liegestütze (gern auf Knien)", cat:"Bewegung", diff:"med", time:"4 Min", xp:18 },
  { title:"10 Burpees light", cat:"Bewegung", diff:"med", time:"4 Min", xp:18 },

  // Bewegung – hard
  { title:"1 km Spaziergang/Joggen", cat:"Bewegung", diff:"hard", time:"12–15 Min", xp:30 },
  { title:"Intervall: 5×(30s schnell/30s langsam)", cat:"Bewegung", diff:"hard", time:"10 Min", xp:30 },
  { title:"Treppen-Challenge: 10 Stockwerke gesamt", cat:"Bewegung", diff:"hard", time:"10–12 Min", xp:32 },
  { title:"Tabata 4 Min (20/10s, 8 Runden)", cat:"Bewegung", diff:"hard", time:"4 Min", xp:28 },

  // Achtsamkeit – easy
  { title:"1 Minute bewusst atmen", cat:"Achtsamkeit", diff:"easy", time:"1 Min", xp:10 },
  { title:"3 Dinge notieren, die gut waren", cat:"Achtsamkeit", diff:"easy", time:"3 Min", xp:10 },
  { title:"30s Body-Scan (Kopf bis Fuß)", cat:"Achtsamkeit", diff:"easy", time:"1 Min", xp:10 },

  // Achtsamkeit – medium
  { title:"5 Minuten offline sein", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },
  { title:"2 Minuten langsame Box-Breathing", cat:"Achtsamkeit", diff:"med", time:"2 Min", xp:15 },
  { title:"1 kurze Meditation (App/YouTube)", cat:"Achtsamkeit", diff:"med", time:"5 Min", xp:15 },

  // Kreativität – easy
  { title:"Skizziere ein kleines Doodle", cat:"Kreativität", diff:"easy", time:"2 Min", xp:10 },
  { title:"Schreibe einen 2‑Zeilen‑Reim", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },
  { title:"Fotografiere etwas in Blau", cat:"Kreativität", diff:"easy", time:"3 Min", xp:10 },

  // Kreativität – medium
  { title:"Schreibe 50 Wörter Freewriting", cat:"Kreativität", diff:"med", time:"5 Min", xp:15 },
  { title:"Skizziere 3 Logo‑Ideen in 5 Min", cat:"Kreativität", diff:"med", time:"5 Min", xp:15 },

  // Soziales – easy
  { title:"Schicke eine nette Nachricht", cat:"Soziales", diff:"easy", time:"3 Min", xp:10 },
  { title:"Bedanke dich bei jemandem", cat:"Soziales", diff:"easy", time:"2 Min", xp:10 },

  // Soziales – medium
  { title:"Kurzes Telefonat mit Freund:in", cat:"Soziales", diff:"med", time:"5 Min", xp:18 },
  { title:"Plane ein kurzes Treffen", cat:"Soziales", diff:"med", time:"5 Min", xp:15 },

  // Ordnung – easy
  { title:"Mülleimer leeren", cat:"Ordnung", diff:"easy", time:"2 Min", xp:8 },
  { title:"Schreibtischfläche wischen", cat:"Ordnung", diff:"easy", time:"2 Min", xp:10 },

  // Ordnung – medium
  { title:"Räume eine kleine Fläche auf", cat:"Ordnung", diff:"med", time:"5 Min", xp:20 },
  { title:"E‑Mail Posteingang: 10 Mails aufräumen", cat:"Ordnung", diff:"med", time:"5 Min", xp:15 },

  // Lernen – easy
  { title:"Lerne 1 neues Wort", cat:"Lernen", diff:"easy", time:"2 Min", xp:10 },
  { title:"Lies 1 Absatz eines Artikels", cat:"Lernen", diff:"easy", time:"3 Min", xp:10 },

  // Lernen – medium
  { title:"2 Karteikarten wiederholen", cat:"Lernen", diff:"med", time:"4 Min", xp:15 },
  { title:"Kurzes Erklärvideo (≤5 Min) schauen", cat:"Lernen", diff:"med", time:"5 Min", xp:15 },

  // Spaß – easy
  { title:"10 Sek. Freestyle‑Tanz", cat:"Spaß", diff:"easy", time:"1 Min", xp:10 },
  { title:"Erfinde einen absurden Superhelden‑Namen", cat:"Spaß", diff:"easy", time:"2 Min", xp:10 },

  // Spaß – medium
  { title:"Mini‑Rätsel lösen (Sudoku/KenKen)", cat:"Spaß", diff:"med", time:"5 Min", xp:15 },
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
    xp: 0,          // XP innerhalb des aktuellen Levels (0–100)
    level: 1,       // aktuelles Level (1,2,3,…)
    lastDay: todayKey(),
    resetAt: nextResetMidnight().toISOString(),
    rerolledForDay: false, // 1×/Tag-Limit
    quests: generateDailyQuestsCategorized(),
  };
}

/* Generiert genau 3 easy, 3 med, 2 hard – robust */
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
    // Safety
    s.xp = Math.max(0, Math.min(100, s.xp|0));
    s.level = Math.max(1, s.level|0);
    if(!Array.isArray(s.quests) || s.quests.length===0){
      s.quests = generateDailyQuestsCategorized();
    }
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

/* Filter state */
let currentFilter = "all";

/* Render */
function renderStatus(){
  $xp.textContent = `${state.xp} XP`;
  $levelValue.textContent = state.level;

  $xpFill.style.width = `${(state.xp/100)*100}%`;
  $nextLevelInfo.textContent = `${state.xp}/100 XP bis Level ${state.level+1}`;

  const r = new Date(state.resetAt);
  const {h,m} = timeToHHMM(Math.max(0, r - now()));
  $resetH.textContent = h; $resetM.textContent = m;

  const total = state.quests.length;
  const done = state.quests.filter(q=>q.done && q.claimed).length;
  $tasksCount.textContent = `${done}/${total} abgeschlossen`;

  $reroll.disabled = !!state.rerolledForDay;
  $reroll.title = state.rerolledForDay ? "Reroll bereits genutzt (morgen wieder)" : "Neue Fragen (1×/Tag)";
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
  const action = !q.done
    ? `<button class="btn" data-act="done" data-id="${q.id}">Erledigt</button>`
    : (!q.claimed
      ? `<button class="btn btn-reroll" data-act="claim" data-id="${q.id}">+${q.xp} XP</button>`
      : `<span class="badge b-cat">✓ Abgeschlossen</span>`);
  return `
    <div class="task ${q.done?"done":""}">
      <div>
        <div class="task-title">${q.title}</div>
        <div class="task-sub">${dif}${cat}${time}</div>
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
  $questList.innerHTML = items || `<div class="muted small">Keine Aufgaben im aktuellen Filter.</div>`;
}
function renderAll(){ renderStatus(); renderQuests(); }
renderAll();

/* Interaktionen: Tasks */
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
$reroll.addEventListener("click", ()=>{
  if(state.rerolledForDay){
    toast("Reroll heute schon genutzt.", "warn");
    playClick();
    return;
  }
  playClick();
  state.quests = generateDailyQuestsCategorized();
  state.rerolledForDay = true;
  toast("Neue Fragen generiert.", "success");
  saveState(); renderAll();
});

/* Reset & Timer */
function checkReset(){
  const r = new Date(state.resetAt);
  if(now() >= r){
    state.lastDay = todayKey();
    state.resetAt = nextResetMidnight().toISOString();
    state.quests = generateDailyQuestsCategorized();
    state.rerolledForDay = false;
    toast("Neuer Tag, neue Fragen!", "success");
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];
document.addEventListener("mousemove", (e)=>{
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
