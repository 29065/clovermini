/* =========================================================
   🍀 CLOVER MINI SLOT - Full Version
   Includes: Symbols, Buffs, Charms, Smooth Spin + Reel Stop FX
   ========================================================= */

// --- SYMBOLS ---
const SYMBOLS = [
  { name: "clover", display: "🍀", value: 2 },
  { name: "cherry", display: "🍒", value: 3 },
  { name: "diamond", display: "💎", value: 5 },
  { name: "bell", display: "🔔", value: 4 },
  { name: "bar", display: "🟪", value: 3 },
  { name: "seven", display: "7️⃣", value: 8 },
  { name: "treasure", display: "🪙", value: 6 },
  { name: "star", display: "⭐", value: 7 }
];

// --- BUFFS ---
const BUFFS = [
  { id: "bonus_interest", name: "Bonus Interest", desc: "Deposits give +30% more coins." },
  { id: "high_chance", name: "Lucky Pull", desc: "High-value symbols appear more often." },
  { id: "extra_spin", name: "Extra Spin", desc: "Gain 1 free spin each round." },
  { id: "double_rewards", name: "Double Rewards", desc: "Wins give double payout next round." }
];

// --- CHARMS ---
const CHARMS = [
  { id: 1, name: "Fortune Clover", desc: "Small boost to win odds.", effect: "clover" },
  { id: 2, name: "Lucky Star", desc: "Occasionally doubles a reward.", effect: "double" },
  { id: 3, name: "Jackpot Magnet", desc: "Increases odds of 7️⃣ appearing.", effect: "jackpot-magnet" },
  { id: 4, name: "Golden Bell", desc: "Increases bell payouts.", effect: "bell-boost" },
  { id: 5, name: "Seven Heaven", desc: "More 7s appear during spins.", effect: "seven_high" }
];

// --- GAME CONSTANTS ---
const ROWS = 3, COLS = 5;
const STARTING_COINS = 15;
const STARTING_TICKETS = 0;
const ROUNDS_PER_RUN = 3;
const REQUIREMENT_BASE = 50;
const REQUIREMENT_SCALE = 1.5;
const INIT_RESTOCK_COST = 2;

// --- Spin Pack Options ---
const PACKS = [
  { spins: 7, cost: 7 },
  { spins: 4, cost: 3 }
];

// --- STATE ---
let gameState = {
  run: 1,
  round: 0,
  coins: STARTING_COINS,
  tickets: STARTING_TICKETS,
  spins: 0,
  coinsDeposited: 0,
  requirement: 0,
  active: false,
  roundActive: false,
  gameOver: false,
  buff: null,
  buffDesc: "",
  inventory: [],
  restockCost: INIT_RESTOCK_COST,
  shopCharms: [],
};

// --- DOM REFERENCES ---
const runNumber = document.getElementById('run-number');
const roundNumber = document.getElementById('round-number');
const coinBalance = document.getElementById('coin-balance');
const ticketBalance = document.getElementById('ticket-balance');
const spinsLeft = document.getElementById('spins-left');
const coinRequirement = document.getElementById('coin-requirement');
const coinsDeposited = document.getElementById('coins-deposited');
const statusDiv = document.getElementById('status');
const slotGrid = document.getElementById('slot-grid');
const spinBtn = document.getElementById('spin-btn');
const startBtn = document.getElementById('start-run');
const slotFeedback = document.getElementById('slot-feedback');
const activeBuff = document.getElementById('active-buff');
const charmInventory = document.getElementById('charm-inventory');
const shopList = document.getElementById('shop-list');
const restockBtn = document.getElementById('restock-btn');
const restockCostSpan = document.getElementById('restock-cost');
const depositAmount = document.getElementById('deposit-amount');
const makeDepositBtn = document.getElementById('make-deposit');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart');
const phoneCallModal = document.getElementById('phone-call-modal');
const buffOptions = document.getElementById('buff-options');
const reelStopSound = document.getElementById('reel-stop-sound');
const finishEarlyBtn = document.getElementById('finish-early-btn');
const buyPack7 = document.getElementById('buy-pack-7');
const buyPack4 = document.getElementById('buy-pack-4');
const spinPackPanel = document.getElementById('spin-pack-panel');

// --- TAB HANDLING ---
const tabBtns = document.querySelectorAll(".tab-btn");
const tabs = {
  slot: document.getElementById("slot-tab"),
  shop: document.getElementById("shop-tab"),
  deposit: document.getElementById("deposit-tab"),
};
tabBtns.forEach(btn => {
  btn.onclick = () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    Object.values(tabs).forEach(tab => tab.classList.remove("active"));
    btn.classList.add("active");
    tabs[btn.dataset.tab].classList.add("active");
  };
});
document.getElementById('tab-slot').classList.add('active');
tabs.slot.classList.add('active');

// --- UTILITIES ---
function randInt(max) { return Math.floor(Math.random() * max); }
function pickRandom(array) { return array[randInt(array.length)]; }
function hasCharm(effect) { return gameState.inventory.some(c => c.effect === effect); }

// --- SYMBOL LOGIC ---
function randSymbol(withWild=false) {
  let pool = [];
  SYMBOLS.forEach(s => {
    let weight = 1;
    if ((gameState.buff && gameState.buff.id === "high_chance") || hasCharm("seven_high")) {
      if (["diamond","treasure","seven","star"].includes(s.name)) weight += 1.7;
    }
    if (hasCharm("jackpot-magnet") && s.name === "seven") weight += 2;
    pool.push(...Array(Math.round(weight)).fill(s));
  });
  let symbol = pickRandom(pool);
  if (withWild && Math.random() < 0.18) {
    return { name: "wild", display: "🃏", value: 0, wild: true };
  }
  return symbol;
}

let currentGrid = [];
function drawGrid(grid, highlight=[]) {
  slotGrid.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'slot-cell';
      if (highlight.some(([hr,hc]) => hr===r && hc===c)) cell.classList.add('win');
      cell.textContent = grid[r][c].display;
      slotGrid.appendChild(cell);
    }
  }
}

// --- SAVE/LOAD ---
function saveState() {
  localStorage.setItem('cloverMiniSave', JSON.stringify({ gameState, currentGrid }));
}
function loadState() {
  const s = localStorage.getItem('cloverMiniSave');
  if (!s) return false;
  try {
    const d = JSON.parse(s);
    if (d.gameState) Object.assign(gameState, d.gameState);
    if (d.currentGrid) currentGrid = d.currentGrid;
    return true;
  } catch { return false; }
}
function clearState() { localStorage.removeItem('cloverMiniSave'); }
/* =========================================================
   🍀 CLOVER MINI SLOT - Part 2 / 2
   Spin, Win, Shop, Buffs, Events, Sounds
   ========================================================= */

// --- SOUND EFFECTS ---
function playSound(id) {
  const s = document.getElementById(id);
  if (s) { s.currentTime = 0; s.play(); }
}

// --- SPIN LOGIC ---
async function spinReels() {
  if (gameState.spins <= 0 || gameState.roundActive) return;
  gameState.spins--;
  spinsLeft.textContent = gameState.spins;
  gameState.roundActive = true;
  slotFeedback.textContent = "Spinning...";

  // Prepare new grid
  const newGrid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randSymbol()));

  // Smooth reel animation
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      currentGrid[r] = currentGrid[r] || [];
      currentGrid[r][c] = SYMBOLS[randInt(SYMBOLS.length)];
    }
    for (let spin = 0; spin < 10; spin++) {
      drawGrid(currentGrid);
      await new Promise(r => setTimeout(r, 50));
      for (let r = 0; r < ROWS; r++) {
        currentGrid[r][c] = randSymbol();
      }
      playSound('reel-stop-sound');
    }
    // Final symbol
    for (let r = 0; r < ROWS; r++) currentGrid[r][c] = newGrid[r][c];
    drawGrid(currentGrid);
  }

  // Check wins (simple: horizontal lines)
  let totalWin = 0;
  let winCells = [];
  for (let r = 0; r < ROWS; r++) {
    const first = currentGrid[r][0].name;
    if (currentGrid[r].every(s => s.name === first || s.wild)) {
      const sum = currentGrid[r].reduce((a,b) => a + b.value,0);
      totalWin += sum;
      for (let c=0;c<COLS;c++) winCells.push([r,c]);
    }
  }
  if (totalWin > 0) {
    gameState.coins += totalWin;
    coinBalance.textContent = gameState.coins;
    slotFeedback.textContent = `You won ${totalWin} coins!`;
    playSound('coin-sound');
  } else {
    slotFeedback.textContent = "No win. Try again!";
  }

  drawGrid(currentGrid, winCells);
  gameState.roundActive = false;
  saveState();
}

// --- ROUND / RUN MANAGEMENT ---
function startRun() {
  gameState.run++;
  gameState.round = 1;
  gameState.spins = 0;
  gameState.coinsDeposited = 0;
  gameState.requirement = Math.floor(REQUIREMENT_BASE * (REQUIREMENT_SCALE ** (gameState.run-1)));
  runNumber.textContent = gameState.run;
  roundNumber.textContent = gameState.round;
  spinsLeft.textContent = gameState.spins;
  coinRequirement.textContent = gameState.requirement;
  coinsDeposited.textContent = gameState.coinsDeposited;
  gameState.active = true;
  statusDiv.textContent = "Run started!";
  spinPackPanel.style.display = 'block';
  saveState();
}

function finishRound() {
  gameState.round++;
  roundNumber.textContent = gameState.round;
  slotFeedback.textContent = `Round ${gameState.round} started!`;
  saveState();
}

function finishEarly() {
  slotFeedback.textContent = "Round ended early.";
  gameState.roundActive = false;
}

// --- SHOP ---
function updateShop() {
  shopList.innerHTML = '';
  gameState.shopCharms.forEach((c,i) => {
    const li = document.createElement('li');
    li.textContent = `${c.name}: ${c.desc} (Price: 3 coins)`;
    const btn = document.createElement('button');
    btn.textContent = 'Buy';
    btn.onclick = () => {
      if (gameState.coins >= 3) {
        gameState.coins -= 3;
        coinBalance.textContent = gameState.coins;
        gameState.inventory.push(c);
        charmInventory.textContent = gameState.inventory.map(ic => ic.name).join(", ");
        gameState.shopCharms.splice(i,1);
        updateShop();
        playSound('coin-sound');
      }
    };
    li.appendChild(btn);
    shopList.appendChild(li);
  });
}

// --- BUFFS ---
function chooseBuff(buffId) {
  const buff = BUFFS.find(b=>b.id===buffId);
  if (!buff) return;
  gameState.buff = buff;
  activeBuff.textContent = buff.name + ": " + buff.desc;
  buffOptions.style.display = 'none';
  saveState();
}

// --- DEPOSIT ---
function makeDeposit() {
  const amount = parseInt(depositAmount.value);
  if (!amount || amount <= 0 || amount > gameState.coins) return;
  gameState.coins -= amount;
  gameState.coinsDeposited += amount;
  coinBalance.textContent = gameState.coins;
  coinsDeposited.textContent = gameState.coinsDeposited;
  if (gameState.coinsDeposited >= gameState.requirement) {
    slotFeedback.textContent = "Requirement met! You can advance to next run.";
    finishEarlyBtn.disabled = false;
  }
  playSound('coin-sound');
  saveState();
}

// --- RESTOCK ---
restockBtn.onclick = () => {
  if (gameState.coins >= gameState.restockCost) {
    gameState.coins -= gameState.restockCost;
    gameState.spins += 3;
    spinsLeft.textContent = gameState.spins;
    coinBalance.textContent = gameState.coins;
    gameState.restockCost = Math.floor(gameState.restockCost * 1.5);
    restockCostSpan.textContent = gameState.restockCost;
    playSound('coin-sound');
    saveState();
  }
};

// --- EVENT LISTENERS ---
spinBtn.onclick = spinReels;
startBtn.onclick = startRun;
finishEarlyBtn.onclick = finishEarly;
makeDepositBtn.onclick = makeDeposit;
buyPack7.onclick = () => { if(gameState.coins >= PACKS[0].cost) {gameState.coins -= PACKS[0].cost; gameState.spins += PACKS[0].spins; coinBalance.textContent = gameState.coins; spinsLeft.textContent = gameState.spins; playSound('coin-sound'); saveState();} };
buyPack4.onclick = () => { if(gameState.coins >= PACKS[1].cost) {gameState.coins -= PACKS[1].cost; gameState.spins += PACKS[1].spins; coinBalance.textContent = gameState.coins; spinsLeft.textContent = gameState.spins; playSound('coin-sound'); saveState();} };
restartBtn.onclick = () => { clearState(); location.reload(); };

// --- INITIALIZE ---
window.onload = () => {
  if (!loadState()) {
    currentGrid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randSymbol()));
  }
  drawGrid(currentGrid);
  coinBalance.textContent = gameState.coins;
  spinsLeft.textContent = gameState.spins;
  runNumber.textContent = gameState.run;
  roundNumber.textContent = gameState.round;
  coinRequirement.textContent = gameState.requirement;
  coinsDeposited.textContent = gameState.coinsDeposited;
  charmInventory.textContent = gameState.inventory.map(c => c.name).join(", ");
  restockCostSpan.textContent = gameState.restockCost;
  if(gameState.buff) activeBuff.textContent = gameState.buff.name + ": " + gameState.buff.desc;
  updateShop();
};

/* =========================================================
   🔊 HTML audio elements required in index.html:
   <audio id="coin-sound" src="coin.mp3"></audio>
   <audio id="reel-stop-sound" src="reel-stop.mp3"></audio>
   ========================================================= */
