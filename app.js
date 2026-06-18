// ===== Daily Sidequests: State, Rendering, Interaktionen =====

// ---------------------------
// Daten & Utilities
// ---------------------------
const QUESTS = [
  // Bewegung
  { title:"15 Kniebeugen", cat:"Bewegung", diff:"leicht", time:"2 Min", reward:{coins:10,xp:10} },
  { title:"10 Sekunden Freestyle‑Tanz", cat:"Humor", diff:"fun", time:"1 Min", reward:{coins:15,xp:15} },
  { title:"20‑Sekunden Plank", cat:"Bewegung", diff:"mittel", time:"2 Min", reward:{coins:25,xp:25} },
  // Achtsamkeit
  { title:"1 Minute bewusst atmen", cat:"Achtsamkeit", diff:"leicht", time:"1 Min", reward:{coins:10,xp:10} },
  { title:"3 Dinge notieren, die gut waren", cat:"Achtsamkeit", diff:"leicht", time:"3 Min", reward:{coins:10,xp:10} },
  // Kreativität
  { title:"Male ein 4‑Linien‑Doodle", cat:"Kreativität", diff:"leicht", time:"2 Min", reward:{coins:10,xp:10} },
  { title:"Schreibe einen 2‑Zeilen‑Reim", cat:"Kreativität", diff:"fun", time:"3 Min", reward:{coins:15,xp:15} },
  // Sozial
  { title:"Schicke jemandem eine nette Nachricht", cat:"Sozial", diff:"leicht", time:"3 Min", reward:{coins:10,xp:10} },
  { title:"Bedanke dich bei einer Person", cat:"Sozial", diff:"leicht", time:"2 Min", reward:{coins:10,xp:10} },
  // Ordnung
  { title:"Räume eine kleine Fläche auf", cat:"Ordnung", diff:"mittel", time:"5 Min", reward:{coins:25,xp:25} },
  { title:"Fülle deine Wasserflasche auf", cat:"Ordnung", diff:"leicht", time:"1 Min", reward:{coins:10,xp:10} },
  // Lernen
  { title:"Lerne 1 neues Wort", cat:"Lernen", diff:"leicht", time:"2 Min", reward:{coins:10,xp:10} },
  { title:"Lies 1 Absatz eines Artikels", cat:"Lernen", diff:"leicht", time:"3 Min", reward:{coins:10,xp:10} },
  // Humor
  { title:"Selfie mit lustiger Grimasse", cat:"Humor", diff:"fun", time:"2 Min", reward:{coins:15,xp:15} },
  { title:"Erfinde einen absurden Superhelden‑Namen", cat:"Humor", diff:"fun", time:"2 Min", reward:{coins:15,xp:15} },
];

const SHOP_ITEMS = [
  { id:"hat_mint", name:"Mint‑Hut", type:"hat", price:60, emoji:"🎩", color:"#7cf1c6" },
  { id:"hat_pink", name:"Pink‑Kappe", type:"hat", price:60, emoji:"🧢", color:"#ff7bc7" },
  { id:"acc_band", name:"Stirnband", type:"acc", price:40, emoji:"🟣", color:"#8aa9ff" },
  { id:"acc_scarf", name:"Schal", type:"acc", price:40, emoji:"🧣", color:"#ffd76d" },
  { id:"hat_star", name:"Stern‑Krone", type:"hat", price:120, emoji:"⭐", color:"#ffd76d" },
  { id:"acc_glow", name:"Glow‑Bar", type:"acc", price:90, emoji:"✨", color:"#5ff3cf" },
];

const STORAGE_KEY="daily_sidequests_v1";
const now = () => new Date();

function todayKey(){
  const d = new Date();
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}
function nextResetMidnight(){
  const d = new Date();
  d.setHours(24,0,0,0);
  return d;
}
function randomPick(arr,n){
  const pool=[...arr];
  const res=[];
  while(res.length<n && pool.length){
    const i = Math.floor(Math.random()*pool.length);
    res.push(pool.splice(i,1)[0]);
  }
  return res;
}

// ---------------------------
// State
// ---------------------------
let state = loadState();

function defaultState(){
  const reset = nextResetMidnight().toISOString();
  const today = todayKey();
  const todaysQuests = generateDailyQuests();
  return {
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    lastDay: today,
    rerollAvailable: true,
    resetAt: reset,
    quests: todaysQuests,
    inventory: [],
    equipped: { hat:null, acc:null }
  };
}
function generateDailyQuests(){
  const fun = QUESTS.filter(q=>q.diff==="fun");
  const nonFun = QUESTS.filter(q=>q.diff!=="fun");
  const picks = [];
  picks.push(randomPick(fun,1)[0]);
  picks.push(randomPick(nonFun,1)[0]);
  let third;
  while(!third){
    const cand = QUESTS[Math.floor(Math.random()*QUESTS.length)];
    if(!picks.includes(cand)) third = cand;
  }
  return [picks[0], picks[1], third].map((q,i)=>({
    id: `${todayKey()}_${i}`,
    ...q,
    done: false,
    claimed: false
  }));
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);

    const nowDate = now();
    const resetAt = s.resetAt ? new Date(s.resetAt) : nextResetMidnight();
    if(nowDate >= resetAt){
      const prevDay = s.lastDay || todayKey();
      const today = todayKey();
      const prev = new Date(prevDay);
      const delta = Math.round((new Date(today) - prev)/86400000);
      let newStreak = s.streak;
      if(delta===1) newStreak += 1;
      else if(delta>1) newStreak = 0;

      s.lastDay = today;
      s.rerollAvailable = true;
      s.resetAt = nextResetMidnight().toISOString();
      s.quests = generateDailyQuests();
      s.streak = newStreak;
      s.level = 1 + Math.floor(s.xp/100);
    }
    return s;
  }catch(e){
    console.warn("State load error", e);
    return defaultState();
  }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------------------------
// DOM Refs
// ---------------------------
const $coins = document.getElementById("coins");
const $xp = document.getElementById("xp");
const $level = document.getElementById("level");
const $streak = document.getElementById("streak");
const $resetTime = document.getElementById("resetTime");
const $questList = document.getElementById("questList");
const $dailyInfo = document.getElementById("dailyInfo");
const $reroll = document.getElementById("reroll");
const $shop = document.getElementById("shop");
const $inventory = document.getElementById("inventory");
const $equipped = document.getElementById("equipped");
const $unequip = document.getElementById("unequip");

// ---------------------------
// Render
// ---------------------------
function fmtTime(date){
  return date.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}
function renderStatus(){
  $coins.textContent = state.coins;
  $xp.textContent = state.xp;
  $level.textContent = state.level;
  $streak.textContent = state.streak;
  const r = new Date(state.resetAt);
  $resetTime.textContent = fmtTime(r);
  const remaining = Math.max(0, r - now());
  const mins = Math.floor(remaining/60000);
  $dailyInfo.textContent = mins>0 ? `Reset in ~${mins} Min` : `Neue Quests verfügbar!`;
}

function questTag(q){
  const t1 = `<span class="tag">${q.cat}</span>`;
  const t2 = `<span class="tag">${q.diff}</span>`;
  const t3 = `<span class="tag">${q.time}</span>`;
  return `<div class="q-tags">${t1}${t2}${t3}</div>`;
}
function renderQuests(){
  $questList.innerHTML = "";
  state.quests.forEach(q=>{
    const el = document.createElement("div");
    el.className = "quest"+(q.done ? " done":"");
    el.innerHTML = `
      <div>
        <div class="q-title">${q.title}</div>
        <div class="q-meta">${questTag(q)}</div>
      </div>
      <div class="q-actions">
        ${!q.done ? `<button class="btn-primary" data-act="done" data-id="${q.id}">Erledigt</button>` :
          (!q.claimed ? `<button class="btn-primary" data-act="claim" data-id="${q.id}">Belohnung</button>` :
          `<span class="badge success">Abgeschlossen ✓</span>`)}
      </div>
    `;
    $questList.appendChild(el);
  });
}
function renderShop(){
  $shop.innerHTML = "";
  SHOP_ITEMS.forEach(item=>{
    const owned = state.inventory.includes(item.id);
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="icon" aria-hidden="true">${item.emoji}</div>
      <div class="meta">
        <b>${item.name}</b>
        <span class="muted">${item.type==="hat"?"Kopfbedeckung":"Accessoire"} • ${item.price} Coins</span>
      </div>
      <div class="q-actions">
        ${owned ? `<button data-act="equip" data-id="${item.id}" class="btn-ghost">Anlegen</button>` :
        `<button data-act="buy" data-id="${item.id}" class="btn-primary">Kaufen</button>`}
      </div>
    `;
    $shop.appendChild(el);
  });
}
function renderInventory(){
  $inventory.innerHTML = "";
  if(state.inventory.length===0){
    $inventory.innerHTML = `<span class="chip">Noch keine Items</span>`;
    return;
  }
  state.inventory.forEach(id=>{
    const item = SHOP_ITEMS.find(i=>i.id===id);
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item ? `${item.name}` : id;
    $inventory.appendChild(chip);
  });
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

  const hatSVG = document.getElementById("hat");
  const accSVG = document.getElementById("acc");
  hatSVG.style.display = hatItem ? "block" : "none";
  accSVG.style.display = accItem ? "block" : "none";
  if(hatItem){
    hatSVG.querySelector("path").setAttribute("fill", hatItem.color || "#7cf1c6");
  }
  if(accItem){
    accSVG.querySelector("rect").setAttribute("fill", accItem.color || "#8aa9ff");
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

// ---------------------------
// Interaktionen
// ---------------------------
document.getElementById("questList").addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  const q = state.quests.find(q=>q.id===id);
  if(!q) return;

  if(act==="done"){
    q.done = true;
    toast(`Quest erledigt: ${q.title} ✓`, "success");
  }
  if(act==="claim" && q.done && !q.claimed){
    q.claimed = true;
    const {coins,xp} = q.reward;
    const streakBonus = (state.streak && state.streak>0 && state.streak % 5 === 0) ? 0.1 : 0;
    const c = Math.round(coins*(1+streakBonus));
    const x = Math.round(xp*(1+streakBonus));
    state.coins += c;
    state.xp += x;
    state.level = 1 + Math.floor(state.xp/100);
    celebrate();
    toast(`Belohnung: +${c} Coins, +${x} XP`, "success");
  }
  saveState(); renderAll();
});

document.getElementById("reroll").addEventListener("click", ()=>{
  if(!state.rerollAvailable){
    toast("Reroll bereits genutzt. Morgen wieder!", "warn");
    return;
  }
  state.quests = generateDailyQuests();
  state.rerollAvailable = false;
  toast("Neue Quests geladen!", "success");
  saveState(); renderAll();
});

document.getElementById("shop").addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const act = btn.dataset.act;
  const id = btn.dataset.id;
  const item = SHOP_ITEMS.find(i=>i.id===id);
  if(!item) return;

  if(act==="buy"){
    if(state.inventory.includes(id)){
      toast("Schon im Inventar.", "warn");
      return;
    }
    if(state.coins < item.price){
      toast("Nicht genug Coins.", "danger");
      return;
    }
    state.coins -= item.price;
    state.inventory.push(id);
    toast(`Gekauft: ${item.name} (-${item.price} Coins)`, "success");
  }else if(act==="equip"){
    if(!state.inventory.includes(id)){
      toast("Nicht im Inventar.", "warn"); return;
    }
    if(item.type==="hat") state.equipped.hat = id;
    if(item.type==="acc") state.equipped.acc = id;
    toast(`${item.name} angelegt!`, "success");
  }
  saveState(); renderAll();
});

document.getElementById("unequip").addEventListener("click", ()=>{
  state.equipped = {hat:null, acc:null};
  toast("Ausrüstung abgelegt.", "warn");
  saveState(); renderAll();
});

// ---------------------------
// Mini‑FX: Toast & Celebrate
// ---------------------------
function toast(msg, type="info"){
  const div = document.createElement("div");
  div.textContent = msg;
  div.style.position="fixed";
  div.style.left="50%";
  div.style.bottom="20px";
  div.style.transform="translateX(-50%)";
  div.style.background = type==="success" ? "linear-gradient(135deg,#4be1a7,#1a8a62)" :
                       type==="warn" ? "linear-gradient(135deg,#ffd76d,#a66b1a)" :
                       type==="danger" ? "linear-gradient(135deg,#ff7b7b,#9a2b2b)" :
                       "linear-gradient(135deg,#5ea2ff,#3a6fe0)";
  div.style.color="#0b0f1b";
  div.style.padding="10px 14px";
  div.style.borderRadius="12px";
  div.style.fontWeight="700";
  div.style.boxShadow="0 10px 30px rgba(0,0,0,.35)";
  div.style.zIndex=9999;
  document.body.appendChild(div);
  setTimeout(()=>{div.style.opacity="0"; div.style.transition="opacity .5s";}, 1600);
  setTimeout(()=>div.remove(), 2200);
}
function celebrate(){
  const conf = document.createElement("canvas");
  conf.width = window.innerWidth; conf.height = window.innerHeight;
  conf.style.position="fixed"; conf.style.left=0; conf.style.top=0; conf.style.pointerEvents="none"; conf.style.zIndex=9998;
  document.body.appendChild(conf);
  const ctx = conf.getContext("2d");
  const parts = [...Array(120)].map(()=>({
    x: Math.random()*conf.width,
    y: -10,
    vx: (Math.random()-.5)*4,
    vy: Math.random()*2+2,
    c: Math.random()<.5 ? "#5ff3cf" : "#5ea2ff",
    s: Math.random()*3+2,
    life: Math.random()*60+40
  }));
  let frame=0;
  function tick(){
    ctx.clearRect(0,0,conf.width,conf.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life--;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x,p.y,p.s,p.s);
    });
    frame++;
    if(frame<100) requestAnimationFrame(tick); else conf.remove();
  }
  tick();
}

// ---------------------------
// Timer: Reset‑Check
// ---------------------------
setInterval(()=>{
  const r = new Date(state.resetAt);
  if(now() >= r){
    state.resetAt = nextResetMidnight().toISOString();
    const prevDay = state.lastDay || todayKey();
    const today = todayKey();
    const prev = new Date(prevDay);
    const delta = Math.round((new Date(today) - prev)/86400000);
    if(delta===1) state.streak += 1;
    else if(delta>1) state.streak = 0;
    state.lastDay = today;
    state.rerollAvailable = true;
    state.quests = generateDailyQuests();
    saveState(); renderAll();
    toast("Neuer Tag, neue Quests!", "success");
  }else{
    renderStatus();
  }
}, 30_000);
