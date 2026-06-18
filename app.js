// ===== Sidequests – Premium v2 =====
// Redesign + Reroll jederzeit nutzbar (kein Tageslimit). Reroll generiert neue Fragen,
// behält Streak/Coins/XP/Inventar. Reset um Mitternacht bleibt bestehen.

const STORAGE_KEY = "sidequests_premium_v4";
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

/* Shop */
const SHOP_ITEMS = [
  { id:"hat_mint", name:"Mint‑Hut", type:"hat", price:100, emoji:"🎩", color:"#7cf1c6" },
  { id:"hat_royal", name:"Royal‑Cap", type:"hat", price:140, emoji:"👑", color:"#ffd76d" },
  { id:"acc_glow", name:"Glow‑Bar", type:"acc", price:90, emoji:"✨", color:"#60e9cf" },
  { id:"acc_band", name:"Stirnband", type:"acc", price:80, emoji:"🎗️", color:"#6aa8ff" },
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
const STATE_VER = 2;
let state = loadState();

function defaultState(){
  return {
    ver: STATE_VER,
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    lastDay: todayKey(),
    resetAt: nextResetMidnight().toISOString(),
    quests: generateDailyQuests(),
    inventory: [],
    equipped: { hat:null, acc:null }
  };
}
function migrate(s){
  if(!s.ver){ s.ver = STATE_VER; }
  // weitere Migrationen bei Bedarf
  return s;
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
    let s = JSON.parse(raw);
    s = migrate(s);
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

/* DOM */
const $coins = $("#coins");
const $xp = $("#xp");
const $level = $("#level");
const $streak = $("#streak");
const $resetH = $("#resetH");
const $resetM = $("#resetM");
const $tasksCount = $("#tasksCount");

const $questList = $("#questList");
const $reroll = $("#reroll");
const $shop = $("#shop");
const $inventory = $("#inventory");
const $equipped = $("#equipped");
const $unequip = $("#unequip");
const $hatSVG = document.getElementById("hat");
const $accSVG = document.getElementById("acc");

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
  if(diff==="easy") return `<span class="badge b-diff-easy"><span class="dot" style="background:#3ed795"></span>Leicht</span>`;
  if(diff==="med")  return `<span class="badge b-diff-med"><span class="dot" style="background:#ffd76d"></span>Mittel</span>`;
  return `<span class="badge b-diff-hard"><span class="dot" style="background:#ff6b6b"></span>Schwer</span>`;
}
function taskRow(q){
  const coins = `<span class="badge b-coins">💰 ${q.reward.coins} Coins</span>`;
  const dif = diffBadge(q.diff);
  const cat = `<span class="badge b-cat">#${q.cat}</span>`;
  const time = `<span class="badge b-cat">⏱ ${q.time}</span>`;
  const action = !q.done
    ? `<button class="btn btn-primary" data-act="done" data-id="${q.id}">Erledigt</button>`
    : (!q.claimed
      ? `<button class="btn btn-primary" data-act="claim" data-id="${q.id}">Belohnung</button>`
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
function renderShop(){
  $shop.innerHTML = SHOP_ITEMS.map(item=>{
    const owned = state.inventory.includes(item.id);
    return `
      <div class="shop-item">
        <div class="icon">${item.emoji}</div>
        <div class="meta">
          <b>${item.name}</b>
          <div class="small">${item.type==="hat"?"Kopfbedeckung":"Accessoire"} • ${item.price} Coins</div>
        </div>
        ${owned
          ? `<button class="btn btn-ghost small" data-act="equip" data-id="${item.id}">Anlegen</button>`
          : `<button class="btn btn-primary small" data-act="buy" data-id="${item.id}">Kaufen</button>`
        }
      </div>
    `;
  }).join("");
}
function renderInventory(){
  if(state.inventory.length===0){
    $inventory.innerHTML = `<span class="chip">Noch keine Items</span>`;
    return;
  }
  $inventory.innerHTML = state.inventory.map(id=>{
    const item = SHOP_ITEMS.find(i=>i.id===id);
    return `<span class="chip">${item?item.name:id}</span>`;
  }).join("");
}
function renderEquipped(){
  const hatId = state.equipped.hat;
  const accId = state.equipped.acc;
  const hatItem = SHOP_ITEMS.find(i=>i.id===hatId);
  const accItem = SHOP_ITEMS.find(i=>i.id===accId);
  const names = [];
  if(hatItem) names.push(hatItem.name);
  if(accItem) names.push(accItem.name);
  $equipped.textContent = names.length? names.join(", "): "—";

  $hatSVG.style.display = hatItem ? "block" : "none";
  $accSVG.style.display = accItem ? "block" : "none";
  if(hatItem){
    $hatSVG.querySelector("path").setAttribute("fill", hatItem.color || "#7cf1c6");
  }
  if(accItem){
    $accSVG.querySelector("rect").setAttribute("fill", accItem.color || "#8aa9ff");
  }
}
function renderAll(){
  renderStatus();
  renderQuests();
  renderShop();
  renderInventory();
  renderEquipped();
}
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

/* Reroll: jederzeit nutzbar */
$reroll.addEventListener("click", ()=>{
  state.quests = generateDailyQuests();
  toast("Fragen neu gemischt!", "success");
  saveState(); renderAll();
});

/* Shop/Inventar */
$shop.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  const item = SHOP_ITEMS.find(i=>i.id===id);
  if(!item) return;

  if(act==="buy"){
    if(state.inventory.includes(id)) { toast("Schon im Inventar.", "warn"); return; }
    if(state.coins < item.price){ toast("Nicht genug Coins.", "danger"); return; }
    state.coins -= item.price;
    state.inventory.push(id);
    toast(`Gekauft: ${item.name} (–${item.price} Coins)`, "success");
  }else if(act==="equip"){
    if(!state.inventory.includes(id)){ toast("Nicht im Inventar.", "warn"); return; }
    if(item.type==="hat") state.equipped.hat = id;
    if(item.type==="acc") state.equipped.acc = id;
    toast(`${item.name} angelegt`, "success");
  }
  saveState(); renderAll();
});

$unequip.addEventListener("click", ()=>{
  state.equipped = { hat:null, acc:null };
  toast("Ausrüstung abgelegt.", "warn");
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
    background: type==="success" ? "linear-gradient(135deg,#60e9cf,#2aa484)" :
               type==="warn" ? "linear-gradient(135deg,#ffd76d,#a66b1a)" :
               type==="danger" ? "linear-gradient(135deg,#ff7b7b,#9a2b2b)" :
                                 "linear-gradient(135deg,#6aa8ff,#3c79eb)",
    color:"#0b0f1b", padding:"10px 14px", borderRadius:"12px",
    fontWeight:"900", letterSpacing:".2px", zIndex:9999,
    boxShadow:"0 10px 30px rgba(0,0,0,.35)"
  });
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .4s"; }, 1600);
  setTimeout(()=> el.remove(), 2200);
}
function celebrate(){
  const c = document.createElement("canvas");
  c.width = window.innerWidth; c.height = window.innerHeight;
  Object.assign(c.style, { position:"fixed", inset:0, pointerEvents:"none", zIndex:9998 });
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  const N = 150;
  const parts = Array.from({length:N}, () => ({
    x: Math.random()*c.width, y: -10,
    vx:(Math.random()-.5)*4, vy: Math.random()*2+2,
    s: Math.random()*3+2, life: Math.random()*60+40,
    col: ["#60e9cf","#6aa8ff","#a88bff"][Math.floor(Math.random()*3)]
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
