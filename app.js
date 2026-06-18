// ===== Sidequests – Cyberpunk Edition =====
// Reroll jederzeit nutzbar. Shop & Avatar entfernt. Fokus auf Fragen/Status.
// Reset um Mitternacht, Streak-Logik bleibt bestehen.

const STORAGE_KEY = "sidequests_cyber_v1";
const DAILY_TASK_COUNT = 8;

/* Fragen/Aufgaben Katalog */
const QUESTS = [
  // Bewegung
  { title:"20 Kniebeugen", cat:"Bewegung", diff:"easy", time:"2 Min", reward:{coins:12, xp:10} },
  { title:"30‑Sekunden Plank", cat:"Bewegung", diff:"med", time:"1 Min", reward:{coins:18, xp:15} },
  { title:"10 Liegestütze", cat:"Bewegung", diff:"med", time:"3 Min", reward:{coins:22, xp:20} },
  { title:"1 km Spaziergang", cat:"Bewegung", diff:"hard", time:"12 Min", reward:{coins:35, xp:30} },
  // Achtsamkeit
  { title:"1 Minute bewusst atmen", cat:"Achtsamkeit", diff:"easy", time:"1 Min", reward:{coins:10, xp:10} },
  { title:"3 Dinge notieren, die gut waren", cat:"Achtsamkeit", diff:"easy", time:"3 Min", reward:{coins:12, xp:10} },
  { title:"5 Minuten offline sein", cat:"Achtsamkeit", diff:"med", time:"5 Min", reward:{coins:18, xp:15} },
  // Kreativität
  { title:"Skizziere ein kleines Doodle", cat:"Kreativität", diff:"easy", time:"2 Min", reward:{coins:12, xp:10} },
  { title:"Schreibe einen 2‑Zeilen‑Reim", cat:"Kreativität", diff:"easy", time:"3 Min", reward:{coins:12, xp:10} },
  { title:"Fotografiere etwas in Blau", cat:"Kreativität", diff:"med", time:"3 Min", reward:{coins:16, xp:12} },
  // Soziales
  { title:"Schicke eine nette Nachricht", cat:"Soziales", diff:"easy", time:"3 Min", reward:{coins:12, xp:10} },
  { title:"Bedanke dich bei jemandem", cat:"Soziales", diff:"easy", time:"2 Min", reward:{coins:12, xp:10} },
  { title:"Kurzes Telefonat mit Freund:in", cat:"Soziales", diff:"med", time:"5 Min", reward:{coins:20, xp:18} },
  // Ordnung
  { title:"Räume eine kleine Fläche auf", cat:"Ordnung", diff:"med", time:"5 Min", reward:{coins:22, xp:20} },
  { title:"Mülleimer leeren", cat:"Ordnung", diff:"easy", time:"2 Min", reward:{coins:10, xp:8} },
  // Lernen
  { title:"Lerne 1 neues Wort", cat:"Lernen", diff:"easy", time:"2 Min", reward:{coins:12, xp:10} },
  { title:"Lies 1 Absatz eines Artikels", cat:"Lernen", diff:"easy", time:"3 Min", reward:{coins:12, xp:10} },
  { title:"2 Karteikarten wiederholen", cat:"Lernen", diff:"med", time:"4 Min", reward:{coins:18, xp:15} },
  // Spaß
  { title:"10 Sek. Freestyle‑Tanz", cat:"Spaß", diff:"easy", time:"1 Min", reward:{coins:12, xp:10} },
  { title:"Erfinde einen absurden Superhelden‑Namen", cat:"Spaß", diff:"easy", time:"2 Min", reward:{coins:12, xp:10} },
];

/* Utils */
const $ = sel => document.querySelector(sel);
const now = () => new Date();
function todayKey(){ return new Date().toISOString().slice(0,10); }
function nextResetMidnight(){ const d = new Date(); d.setHours(24,0,0,0); return d; }
function pickRandom(arr, n){
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
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    lastDay: todayKey(),
    resetAt: nextResetMidnight().toISOString(),
    quests: generateDailyQuests(),
  };
}
function generateDailyQuests(){
  const chosen = pickRandom(QUESTS, DAILY_TASK_COUNT).map((q,i)=>({
    id: `${todayKey()}_${i}`,
    ...q,
    done:false,
    claimed:false
  }));
  const w = d => d==="easy"?1: d==="med"?2: 3;
  chosen.sort((a,b)=> w(a.diff)-w(b.diff));
  return chosen;
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);
    // Tagesreset
    const r = s.resetAt ? new Date(s.resetAt) : nextResetMidnight();
    if(now() >= r){
      const prev = new Date(s.lastDay || todayKey());
      const today = new Date(todayKey());
      const delta = Math.round((today - prev)/86400000);
      if(delta===1) s.streak = (s.streak||0)+1;
      else if(delta>1) s.streak = 0;

      s.lastDay = todayKey();
      s.resetAt = nextResetMidnight().toISOString();
      s.quests = generateDailyQuests();
    }
    s.level = 1 + Math.floor((s.xp||0)/100);
    return s;
  }catch(e){
    console.warn("State load error", e);
    return defaultState();
  }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* DOM refs */
const $coins = $("#coins");
const $xp = $("#xp");
const $level = $("#level");
const $streak = $("#streak");
const $resetH = $("#resetH");
const $resetM = $("#resetM");
const $tasksCount = $("#tasksCount");
const $questList = $("#questList");
const $reroll = $("#reroll");

/* Render */
function renderStatus(){
  $coins.textContent = state.coins;
  $xp.textContent = state.xp;
  state.level = 1 + Math.floor(state.xp/100);
  $level.textContent = state.level;
  $streak.textContent = state.streak;

  const r = new Date(state.resetAt);
  const {h,m} = timeToHHMM(Math.max(0, r - now()));
  $resetH.textContent = h; $resetM.textContent = m;

  $tasksCount.textContent = `${state.quests.filter(q=>q.done).length}/${state.quests.length} erledigt`;
}
function diffBadge(diff){
  if(diff==="easy") return `<span class="badge b-diff-easy"><span class="dot" style="background:#7bffc8"></span>Leicht</span>`;
  if(diff==="med")  return `<span class="badge b-diff-med"><span class="dot" style="background:#ffd86b"></span>Mittel</span>`;
  return `<span class="badge b-diff-hard"><span class="dot" style="background:#ff8cb8"></span>Schwer</span>`;
}
function taskRow(q){
  const coins = `<span class="badge b-coins">💰 ${q.reward.coins} Coins</span>`;
  const dif = diffBadge(q.diff);
  const cat = `<span class="badge b-cat">#${q.cat}</span>`;
  const time = `<span class="badge b-cat">⏱ ${q.time}</span>`;
  const action = !q.done
    ? `<button class="btn btn-reroll" data-act="done" data-id="${q.id}">Erledigt</button>`
    : (!q.claimed
      ? `<button class="btn" data-act="claim" data-id="${q.id}">Belohnung</button>`
      : `<span class="badge b-cat">✓ Abgeschlossen</span>`);
  return `
    <div class="task ${q.done?"done":""}">
      <div>
        <div class="task-title">${q.title}</div>
        <div class="task-sub">${coins}${dif}${cat}${time}</div>
      </div>
      <div class="actions">${action}</div>
    </div>
  `;
}
function renderQuests(){
  $questList.innerHTML = state.quests.map(taskRow).join("");
}
function renderAll(){ renderStatus(); renderQuests(); }
renderAll();

/* Interaktionen */
$questList.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  const q = state.quests.find(x=>x.id===id);
  if(!q) return;

  if(act==="done"){
    q.done = true;
    toast(`Erledigt: ${q.title}`, "success");
  }else if(act==="claim"){
    if(!q.done || q.claimed) return;
    q.claimed = true;
    state.coins += q.reward.coins;
    state.xp += q.reward.xp;
    celebrate();
    toast(`Belohnung: +${q.reward.coins} Coins • +${q.reward.xp} XP`, "success");
  }
  saveState(); renderAll();
});

/* Reroll: jederzeit möglich – keine Limits, kein versteckter Flag */
$reroll.addEventListener("click", ()=>{
  state.quests = generateDailyQuests();
  toast("Fragen neu gemischt!", "success");
  saveState(); renderAll();
});

/* Reset & Timer */
function checkReset(){
  const r = new Date(state.resetAt);
  if(now() >= r){
    const prev = new Date(state.lastDay || todayKey());
    const today = new Date(todayKey());
    const delta = Math.round((today - prev)/86400000);
    if(delta===1) state.streak += 1;
    else if(delta>1) state.streak = 0;

    state.lastDay = todayKey();
    state.resetAt = nextResetMidnight().toISOString();
    state.quests = generateDailyQuests();
    toast("Neuer Tag, neue Fragen!", "success");
    saveState(); renderAll();
  }else{
    renderStatus();
  }
}
setInterval(checkReset, 15_000);

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
  const ctx = c.getContext("2d");
  const N = 140;
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*c.width, y: -10,
    vx:(Math.random()-.5)*4, vy: Math.random()*2+2,
    s: Math.random()*3+2, life: Math.random()*60+40,
    col: Math.random()<.5 ? "#37f2e7" : "#b38aff"
  }));
  let f=0;
  (function tick(){
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life--;
      ctx.fillStyle=p.col; ctx.fillRect(p.x,p.y,p.s,p.s);
    });
    f++;
    if(f<110) requestAnimationFrame(tick); else c.remove();
  })();
}
