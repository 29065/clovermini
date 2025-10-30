// --- SYMBOLS ---
const SYMBOLS = [
  { name: "lemon", display: "🍋", value: 1 },
  { name: "cherry", display: "🍒", value: 1 },
  { name: "clover", display: "🍀", value: 2 },
  { name: "bell", display: "🔔", value: 2 },
  { name: "diamond", display: "💎", value: 5 },
  { name: "treasure", display: "🪙", value: 6 },
  { name: "seven", display: "7️⃣", value: 7 },
  { name: "grape", display: "🍇", value: 3 },
  { name: "banana", display: "🍌", value: 2 },
  { name: "star", display: "🌟", value: 4 }
];

// --- BUFFS (Phone Call) ---
const BUFFS = [
  {
    id: "plus1_all",
    label: "All winnings +1 per symbol this round",
    effect: (prize, count) => prize + count
  },
  {
    id: "next_deposit_double",
    label: "Next deposit earns double coins (once)",
    effect: null
  },
  {
    id: "high_chance",
    label: "Increased chance for high-value symbols",
    effect: null
  },
  {
    id: "double_ticket",
    label: "Double tickets from slot this round",
    effect: null
  },
  {
    id: "wild_card",
    label: "1 random wild symbol per spin",
    effect: null
  }
];

// --- CHARMS ---
const CHARMS = [
  // --- Add a variety of effects and icons ---
  { id: "lucky-star", name: "Lucky Star", icon: "🌟", desc: "Slot payouts +1 per match.", cost: 7, effect: "slot_plus1" },
  { id: "double-cherry", name: "Double Cherry", icon: "🍒", desc: "Cherries are worth double.", cost: 8, effect: "cherry_double" },
  { id: "lemon-zest", name: "Lemon Zest", icon: "🍋", desc: "Lemons are worth double.", cost: 8, effect: "lemon_double" },
  { id: "jackpot-magnet", name: "Jackpot Magnet", icon: "7️⃣", desc: "7's are more likely.", cost: 10, effect: "seven_high" },
  { id: "bell-ringer", name: "Bell Ringer", icon: "🔔", desc: "+2 coins for each bell.", cost: 6, effect: "bell_bonus" },
  { id: "gem-fan", name: "Gem Fan", icon: "💎", desc: "Diamonds are worth double.", cost: 9, effect: "diamond_double" },
  { id: "chest-finder", name: "Chest Finder", icon: "🪙", desc: "Treasure Chests are worth double.", cost: 9, effect: "treasure_double" },
  { id: "clover-boost", name: "Clover Boost", icon: "🍀", desc: "Clovers are worth double.", cost: 8, effect: "clover_double" },
  { id: "grape-glow", name: "Grape Glow", icon: "🍇", desc: "Grapes are worth double.", cost: 8, effect: "grape_double" },
  { id: "banana-blast", name: "Banana Blast", icon: "🍌", desc: "Bananas are worth double.", cost: 8, effect: "banana_double" },
  { id: "extra-spin", name: "Extra Spin", icon: "🔄", desc: "Get 1 extra spin per round.", cost: 12, effect: "extra_spin" },
  { id: "ticket-doubler", name: "Ticket Doubler", icon: "🎟️", desc: "Double tickets from any source.", cost: 12, effect: "ticket_double" },
  { id: "all-wild", name: "All Wild", icon: "🃏", desc: "One random wild symbol per spin.", cost: 15, effect: "wild_per_spin" },
  { id: "multi-match", name: "Multi Match", icon: "✨", desc: "All win lines pay +1 per symbol.", cost: 13, effect: "multi_plus" },
  { id: "restock-coupon", name: "Restock Coupon", icon: "🛒", desc: "Restock cost never increases.", cost: 11, effect: "restock_freeze" },
  { id: "bonus-burst", name: "Bonus Burst", icon: "💥", desc: "Every spin, +2 coins if any win.", cost: 10, effect: "bonus_on_win" },
  { id: "lucky-seven", name: "Lucky Seven", icon: "🍀7️⃣", desc: "If a 7 is in a win line, +5 coins.", cost: 12, effect: "seven_bonus" },
  { id: "star-power", name: "Star Power", icon: "🌠", desc: "Stars are worth triple.", cost: 16, effect: "star_triple" },
  { id: "miracle", name: "Miracle", icon: "🎲", desc: "Once per run: instantly complete a round.", cost: 20, effect: "auto_complete" },
  { id: "jackpot", name: "Jackpot!", icon: "💰", desc: "Wins of 5 in a row pay double.", cost: 17, effect: "five_double" }
  // ...add more!
];

// --- GAME CONSTANTS ---
const ROWS = 3, COLS = 5;
const STARTING_COINS = 0;
const STARTING_TICKETS = 0;
const ROUNDS_PER_RUN = 3;
const REQUIREMENT_BASE = 50;
const REQUIREMENT_SCALE = 1.5;
const TICKET_PER = 20;
const INIT_RESTOCK_COST = 2;

// --- GAME STATE ---
let gameState = {
  run: 1,
  round: 0,
  coins: STARTING_COINS,
  tickets: STARTING_TICKETS,
  coinsDeposited: 0,
  requirement: 0,
  active: false,
  roundActive: false,
  gameOver: false,
  buff: null,
  buffDesc: "",
  doubleDepositPending: false,
  inventory: [],
  extraSpinUsed: false,
  restockCost: INIT_RESTOCK_COST,
  shopCharms: [],
  miracleUsed: false
};

// --- DOM ELEMENTS ---
const runNumber = document.getElementById('run-number');
const roundNumber = document.getElementById('round-number');
const coinBalance = document.getElementById('coin-balance');
const ticketBalance = document.getElementById('ticket-balance');
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
const shopMessage = document.getElementById('shop-message');
const restockBtn = document.getElementById('restock-btn');
const restockCostSpan = document.getElementById('restock-cost');
const depositAmount = document.getElementById('deposit-amount');
const makeDepositBtn = document.getElementById('make-deposit');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart');
const buffOptions = document.getElementById('buff-options');
const phoneCallModal = document.getElementById('phone-call-modal');

// TABS
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
function hasCharm(effectId) { return gameState.inventory.some(c=>c.effect===effectId); }
function charmCount(effectId) { return gameState.inventory.filter(c=>c.effect===effectId).length; }
function getShopableCharms() {
  // Don't show already owned charms
  return CHARMS.filter(c => !gameState.inventory.some(inv => inv.id === c.id));
}

// --- SLOT MACHINE ---
let currentGrid = [];

function randSymbol(withWild=false) {
  // Weighted for buffs/charms
  let pool = [];
  SYMBOLS.forEach(s => {
    let weight = 1;
    if ((gameState.buff && gameState.buff.id === "high_chance") || hasCharm("seven_high")) {
      if (["diamond","treasure","seven","star"].includes(s.name)) weight += 1.7;
    }
    if (hasCharm("jackpot-magnet") && s.name === "seven") weight += 2;
    pool.push(...Array(Math.round(weight), s));
  });
  let symbol = pickRandom(pool);
  if (withWild && Math.random() < 0.18) {
    // 18% chance for a wild (if wild_per_spin or wild_card buff is active)
    return { name: "wild", display: "🃏", value: 0, wild: true };
  }
  return symbol;
}

function drawGrid(grid, highlightCells=[]) {
  slotGrid.innerHTML = '';
  for (let r=0; r<ROWS; ++r) {
    for (let c=0; c<COLS; ++c) {
      const cell = document.createElement('div');
      cell.className = 'slot-cell';
      if (highlightCells.some(([hr,hc]) => hr===r && hc===c)) {
        cell.classList.add('win');
      }
      cell.textContent = grid[r][c].display;
      slotGrid.appendChild(cell);
    }
  }
}

async function animateSpin() {
  slotGrid.classList.add('spinning');
  for (let i=0; i<18; ++i) {
    let tempGrid = [];
    for (let r=0; r<ROWS; ++r) {
      tempGrid[r] = [];
      for (let c=0; c<COLS; ++c) {
        tempGrid[r][c] = randSymbol();
      }
    }
    drawGrid(tempGrid);
    await new Promise(res => setTimeout(res, 40 + i*7));
  }
  slotGrid.classList.remove('spinning');
}

function detectWins(grid) {
  let wins = [];
  let visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const dirs = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let r=0; r<ROWS; ++r) {
    for (let c=0; c<COLS; ++c) {
      for (let [dr,dc] of dirs) {
        let cells = [[r,c]];
        let sym = grid[r][c];
        let rr = r+dr, cc = c+dc;
        while (
          rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS &&
          matchSymbol(grid[rr][cc], sym)
        ) {
          cells.push([rr,cc]);
          rr += dr; cc += dc;
        }
        if (cells.length >= 3) {
          let newCells = cells.filter(([row,col]) => !visited[row][col]);
          if (newCells.length === cells.length) {
            wins.push({ symbol: sym, cells });
            cells.forEach(([row,col]) => { visited[row][col] = true; });
          }
        }
      }
    }
  }
  return wins;
}
function matchSymbol(a, b) {
  // Wild matches any
  if (a.wild || b.wild) return true;
  return a.name === b.name;
}

async function doSpin() {
  if (!gameState.roundActive) {
    statusDiv.textContent = "Start the round first!";
    return;
  }
  spinBtn.disabled = true;
  slotFeedback.textContent = "";
  await animateSpin();
  // --- Build grid (with up to 1 wild if buff or charm) ---
  let withWild = (gameState.buff && gameState.buff.id === "wild_card") || hasCharm("wild_per_spin");
  let wildPlaced = false;
  currentGrid = [];
  for (let r=0; r<ROWS; ++r) {
    currentGrid[r] = [];
    for (let c=0; c<COLS; ++c) {
      if (withWild && !wildPlaced && Math.random() < 0.16) {
        currentGrid[r][c] = { name: "wild", display: "🃏", value: 0, wild: true };
        wildPlaced = true;
      } else {
        currentGrid[r][c] = randSymbol();
      }
    }
  }
  drawGrid(currentGrid);
  // --- Detect wins and calculate payout ---
  let wins = detectWins(currentGrid);
  let totalWin = 0, ticketEarn = 0, bonus = 0;
  let highlight = [];
  let winText = [];
  wins.forEach(win => {
    let {symbol, cells} = win;
    let count = cells.length;
    let basePay = symbol.value;
    // Apply charms
    if (symbol.name==="lemon" && hasCharm("lemon_double")) basePay *= 2;
    if (symbol.name==="cherry" && hasCharm("cherry_double")) basePay *= 2;
    if (symbol.name==="clover" && hasCharm("clover_double")) basePay *= 2;
    if (symbol.name==="bell" && hasCharm("bell_bonus")) basePay += 2;
    if (symbol.name==="diamond" && hasCharm("diamond_double")) basePay *= 2;
    if (symbol.name==="treasure" && hasCharm("treasure_double")) basePay *= 2;
    if (symbol.name==="grape" && hasCharm("grape_double")) basePay *= 2;
    if (symbol.name==="banana" && hasCharm("banana_double")) basePay *= 2;
    if (symbol.name==="star" && hasCharm("star_triple")) basePay *= 3;
    // Buffs
    if (gameState.buff && gameState.buff.id === "plus1_all") basePay += 1;
    if (hasCharm("slot_plus1")) basePay += 1;
    if (hasCharm("multi_plus")) basePay += 1;
    // 5-in-a-row double
    let patternPay = basePay * count;
    if (count === 5 && hasCharm("five_double")) patternPay *= 2;
    totalWin += patternPay;
    winText.push(`${symbol.wild ? "Wildcard" : symbol.display} x${count} = ${patternPay}`);
    highlight.push(...cells);
    // Special bonuses
    if (hasCharm("bonus_on_win")) bonus += 2;
    if (hasCharm("seven_bonus") && (symbol.name==="seven" || cells.some(([r,c])=>currentGrid[r][c].name==="seven"))) bonus += 5;
  });
  // Bonus burst
  totalWin += bonus;

  // Tickets: 1 per TICKET_PER coins, doubled with charm/buff
  ticketEarn = Math.floor(totalWin / TICKET_PER);
  if ((gameState.buff && gameState.buff.id === "double_ticket") || hasCharm("ticket_double")) ticketEarn *= 2;

  // Display win
  setTimeout(() => {
    drawGrid(currentGrid, highlight);
    if (totalWin > 0) {
      gameState.coins += totalWin;
      gameState.tickets += ticketEarn;
      slotFeedback.innerHTML = `✨ <b>Win!</b> ${winText.join(', ')}`
        + (bonus ? ` <span style="color:#c39e11;">(+${bonus} bonus)</span>` : '')
        + (ticketEarn ? ` <span style="color:#a873f7;">+${ticketEarn} ticket${ticketEarn>1?'s':''}</span>` : '');
    } else {
      slotFeedback.textContent = `No win. Try again!`;
    }
    spinBtn.disabled = false;
    // Extra spin charm: one extra slot per round
    if (hasCharm("extra_spin") && !gameState.extraSpinUsed) {
      gameState.extraSpinUsed = true;
      spinBtn.disabled = false;
      statusDiv.textContent = "Extra spin from charm! (One per round)";
    }
    updateUI();
  }, 600);
}

// --- ROUND/BUFFS/DEPOSIT ---
function resetGame() {
  gameState = {
    run: 1,
    round: 0,
    coins: STARTING_COINS,
    tickets: STARTING_TICKETS,
    coinsDeposited: 0,
    requirement: 0,
    active: false,
    roundActive: false,
    gameOver: false,
    buff: null,
    buffDesc: "",
    doubleDepositPending: false,
    inventory: [],
    extraSpinUsed: false,
    restockCost: INIT_RESTOCK_COST,
    shopCharms: [],
    miracleUsed: false
  };
  restockShop();
  updateUI();
}

function startRun() {
  gameState.active = true;
  gameState.round = 0;
  gameState.coins = STARTING_COINS;
  gameState.tickets = STARTING_TICKETS;
  gameState.coinsDeposited = 0;
  gameState.gameOver = false;
  gameState.buff = null;
  gameState.buffDesc = "";
  gameState.doubleDepositPending = false;
  gameState.extraSpinUsed = false;
  gameState.miracleUsed = false;
  slotFeedback.textContent = "";
  startBtn.disabled = true;
  gameOverScreen.style.display = 'none';
  restockShop();
  updateUI();
}

function startRound() {
  if (!gameState.active || gameState.gameOver) return;
  gameState.round++;
  gameState.roundActive = true;
  gameState.coinsDeposited = 0;
  gameState.requirement = Math.floor(REQUIREMENT_BASE * Math.pow(REQUIREMENT_SCALE, gameState.round - 1));
  gameState.buff = null;
  gameState.buffDesc = "";
  gameState.doubleDepositPending = false;
  gameState.extraSpinUsed = false;
  slotFeedback.textContent = "";
  // Show phone call (buff) modal
  showPhoneCall();
  updateUI();
}

function showPhoneCall() {
  let buffs = BUFFS.slice();
  let options = [];
  while (options.length < 3 && buffs.length > 0) {
    let idx = randInt(buffs.length);
    options.push(buffs[idx]);
    buffs.splice(idx, 1);
  }
  buffOptions.innerHTML = "";
  options.forEach(buff => {
    let btn = document.createElement("button");
    btn.className = "buff-btn";
    btn.textContent = buff.label;
    btn.onclick = () => selectBuff(buff);
    buffOptions.appendChild(btn);
  });
  phoneCallModal.style.display = "block";
}
function selectBuff(buff) {
  gameState.buff = buff;
  gameState.buffDesc = buff.label;
  if (buff.id === "next_deposit_double") gameState.doubleDepositPending = true;
  phoneCallModal.style.display = "none";
  statusDiv.textContent = `Round ${gameState.round} started! Buff: ${buff.label}`;
  updateUI();
}

function makeDeposit() {
  const amt = parseInt(depositAmount.value, 10);
  if (isNaN(amt) || amt <= 0) {
    statusDiv.textContent = 'Enter a valid deposit amount.';
    return;
  }
  if (amt > gameState.coins) {
    statusDiv.textContent = 'Not enough coins!';
    return;
  }
  let depositTotal = amt;
  if (gameState.buff && gameState.buff.id === "next_deposit_double" && gameState.doubleDepositPending) {
    depositTotal *= 2;
    gameState.doubleDepositPending = false;
    statusDiv.textContent = `Deposited ${amt} coins (doubled to ${depositTotal})!`;
  } else {
    statusDiv.textContent = `Deposited ${amt} coins!`;
  }
  gameState.coins -= amt;
  gameState.coinsDeposited += depositTotal;
  updateUI();
  checkRoundCompletion();
}
function checkRoundCompletion() {
  if (gameState.coinsDeposited >= gameState.requirement) {
    roundComplete();
  }
}
function roundComplete() {
  statusDiv.textContent = `Round ${gameState.round} complete! Spin for next round.`;
  gameState.roundActive = false;
  slotFeedback.textContent = "";
  if (gameState.round >= ROUNDS_PER_RUN) {
    statusDiv.textContent = '🎉 You finished all rounds of this run!';
    gameOverScreen.style.display = 'block';
    gameState.active = false;
    startBtn.disabled = false;
  }
  updateUI();
}

// --- SHOP ---
function restockShop() {
  let shopable = getShopableCharms();
  let picks = [];
  let pool = [...shopable];
  while (picks.length < 5 && pool.length) {
    let idx = randInt(pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  gameState.shopCharms = picks;
  renderShop();
}
function restockShopBtn() {
  if (gameState.tickets < gameState.restockCost) {
    shopMessage.textContent = "Not enough tickets to restock!";
    return;
  }
  gameState.tickets -= gameState.restockCost;
  if (!hasCharm("restock_freeze")) gameState.restockCost = Math.ceil(gameState.restockCost * 1.7 + 1);
  restockShop();
  shopMessage.textContent = "Shop restocked!";
  updateUI();
}
function renderShop() {
  restockCostSpan.textContent = gameState.restockCost;
  shopList.innerHTML = "";
  if (!gameState.shopCharms.length) {
    shopList.innerHTML = "<i>No charms available.</i>";
    return;
  }
  gameState.shopCharms.forEach(charm => {
    const owned = gameState.inventory.some(c => c.id === charm.id);
    const div = document.createElement("div");
    div.className = "shop-charm";
    div.innerHTML = `<div class="icon">${charm.icon}</div>
      <div class="info"><b>${charm.name}</b> <span style="color:#888;">(${charm.cost} tickets)</span><br>
      <span style="font-size:0.97em">${charm.desc}</span></div>`;
    const btn = document.createElement("button");
    btn.className = "buy-btn";
    btn.disabled = owned || gameState.tickets < charm.cost;
    btn.textContent = owned ? "Owned" : "Buy";
    btn.onclick = () => {
      if (!owned && gameState.tickets >= charm.cost) {
        gameState.tickets -= charm.cost;
        gameState.inventory.push({...charm});
        shopMessage.textContent = `Purchased ${charm.name}!`;
        renderInventory();
        renderShop();
        updateUI();
      }
    };
    div.appendChild(btn);
    shopList.appendChild(div);
  });
}

// --- INVENTORY ---
function renderInventory() {
  charmInventory.innerHTML = "";
  if (gameState.inventory.length === 0) {
    charmInventory.innerHTML = "<li>No charms yet.</li>";
    return;
  }
  gameState.inventory.forEach(charm => {
    let li = document.createElement("li");
    li.innerHTML = `<span style="font-size:1.2em;">${charm.icon}</span> ${charm.name}<br><span style="font-size:0.97em;color:#8b7cb1">${charm.desc}</span>`;
    charmInventory.appendChild(li);
  });
}

// --- UI UPDATE ---
function updateUI() {
  runNumber.textContent = gameState.run;
  roundNumber.textContent = gameState.round || '-';
  coinBalance.textContent = gameState.coins;
  ticketBalance.textContent = gameState.tickets;
  coinRequirement.textContent = gameState.requirement || '-';
  coinsDeposited.textContent = gameState.coinsDeposited;
  activeBuff.textContent = gameState.buffDesc ? `Buff: ${gameState.buffDesc}` : '';
  renderInventory();
  renderShop();
}

// --- GAME OVER HANDLING ---
function gameOver() {
  gameState.gameOver = true;
  gameState.active = false;
  statusDiv.textContent = `Game Over! You did not deposit enough coins in time.`;
  updateUI();
}
function restart() {
  gameState.run += 1;
  startRun();
}

// --- EVENT LISTENERS ---
spinBtn.addEventListener('click', doSpin);
startBtn.addEventListener('click', () => {
  startRun(); startRound();
});
restockBtn.addEventListener('click', restockShopBtn);
makeDepositBtn.addEventListener('click', makeDeposit);
restartBtn.addEventListener('click', restart);
// Modal close by click outside
window.onclick = function(event) {
  if (event.target === phoneCallModal) phoneCallModal.style.display = "none";
};
// Keyboard: Enter in deposit box
depositAmount.addEventListener('keydown', function(e) {
  if (e.key === "Enter") makeDeposit();
});

// --- INIT ---
resetGame();
drawGrid(Array.from({length: ROWS}, ()=>Array.from({length: COLS}, randSymbol)));