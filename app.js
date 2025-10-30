// SYMBOLS, BUFFS, CHARMS as in previous code -- not repeated for brevity
// ... (Insert SYMBOLS, BUFFS, CHARMS arrays here, unchanged from previous version)

const ROWS = 3, COLS = 5;
const STARTING_COINS = 0;
const STARTING_TICKETS = 0;
const ROUNDS_PER_RUN = 3;
const REQUIREMENT_BASE = 50;
const REQUIREMENT_SCALE = 1.5;
const TICKET_PER = 20;
const INIT_RESTOCK_COST = 2;

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
  miracleUsed: false,
  roundSpun: 0, // NEW: track spins this round
};

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
const finishEarlyBtn = document.getElementById('finish-early-btn');
const earlyBonusSpan = document.getElementById('early-bonus');

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

function randInt(max) { return Math.floor(Math.random() * max); }
function pickRandom(array) { return array[randInt(array.length)]; }
function hasCharm(effectId) { return gameState.inventory.some(c=>c.effect===effectId); }
function charmCount(effectId) { return gameState.inventory.filter(c=>c.effect===effectId).length; }
function getShopableCharms() { return CHARMS.filter(c => !gameState.inventory.some(inv => inv.id === c.id)); }

let currentGrid = [];

function randSymbol(withWild=false) {
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

  // Build grid, guarantee every slot gets a symbol
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

  // Detect wins and payout
  let wins = detectWins(currentGrid);
  let totalWin = 0, ticketEarn = 0, bonus = 0;
  let highlight = [];
  let winText = [];
  wins.forEach(win => {
    let {symbol, cells} = win;
    let count = cells.length;
    let basePay = symbol.value;
    if (symbol.name==="lemon" && hasCharm("lemon_double")) basePay *= 2;
    if (symbol.name==="cherry" && hasCharm("cherry_double")) basePay *= 2;
    if (symbol.name==="clover" && hasCharm("clover_double")) basePay *= 2;
    if (symbol.name==="bell" && hasCharm("bell_bonus")) basePay += 2;
    if (symbol.name==="diamond" && hasCharm("diamond_double")) basePay *= 2;
    if (symbol.name==="treasure" && hasCharm("treasure_double")) basePay *= 2;
    if (symbol.name==="grape" && hasCharm("grape_double")) basePay *= 2;
    if (symbol.name==="banana" && hasCharm("banana_double")) basePay *= 2;
    if (symbol.name==="star" && hasCharm("star_triple")) basePay *= 3;
    if (gameState.buff && gameState.buff.id === "plus1_all") basePay += 1;
    if (hasCharm("slot_plus1")) basePay += 1;
    if (hasCharm("multi_plus")) basePay += 1;
    let patternPay = basePay * count;
    if (count === 5 && hasCharm("five_double")) patternPay *= 2;
    totalWin += patternPay;
    winText.push(`${symbol.wild ? "Wildcard" : symbol.display} x${count} = ${patternPay}`);
    highlight.push(...cells);
    if (hasCharm("bonus_on_win")) bonus += 2;
    if (hasCharm("seven_bonus") && (symbol.name==="seven" || cells.some(([r,c])=>currentGrid[r][c].name==="seven"))) bonus += 5;
  });
  totalWin += bonus;
  ticketEarn = Math.floor(totalWin / TICKET_PER);
  if ((gameState.buff && gameState.buff.id === "double_ticket") || hasCharm("ticket_double")) ticketEarn *= 2;

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
    if (hasCharm("extra_spin") && !gameState.extraSpinUsed) {
      gameState.extraSpinUsed = true;
      spinBtn.disabled = false;
      statusDiv.textContent = "Extra spin from charm! (One per round)";
    }
    gameState.roundSpun++;
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
    miracleUsed: false,
    roundSpun: 0,
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
  gameState.roundSpun = 0;
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
  gameState.roundSpun = 0;
  slotFeedback.textContent = "";
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
    roundComplete("deposit");
  }
}

// --- EARLY FINISH ---
function getEarlyFinishBonus() {
  // If you didn't spin at all: 12 tickets
  // After 1 spin: 8, after 2: 4, after 3+: 0
  if (gameState.roundSpun === 0) return 12;
  if (gameState.roundSpun === 1) return 8;
  if (gameState.roundSpun === 2) return 4;
  return 0;
}
function updateEarlyBonus() {
  let bonus = getEarlyFinishBonus();
  earlyBonusSpan.textContent = bonus > 0 ? `Bonus: +${bonus} tickets` : "No bonus";
  finishEarlyBtn.disabled = !gameState.roundActive || bonus === 0;
}
function finishEarly() {
  let bonus = getEarlyFinishBonus();
  if (bonus > 0 && gameState.roundActive) {
    gameState.tickets += bonus;
    roundComplete("early");
  }
}

function roundComplete(reason) {
  let msg = `Round ${gameState.round} complete! `;
  if (reason === "early") {
    msg += `Finished early.`;
  }
  // Always +1 ticket at end of round
  gameState.tickets += 1;
  msg += " +1 ticket!";
  statusDiv.textContent = msg;
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

// SHOP, INVENTORY, UI, GAME OVER: identical to previous version, not repeated here for brevity

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
  updateEarlyBonus();
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

spinBtn.addEventListener('click', doSpin);
startBtn.addEventListener('click', () => {
  startRun(); startRound();
});
restockBtn.addEventListener('click', restockShopBtn);
makeDepositBtn.addEventListener('click', makeDeposit);
finishEarlyBtn.addEventListener('click', finishEarly);
restartBtn.addEventListener('click', restart);
window.onclick = function(event) {
  if (event.target === phoneCallModal) phoneCallModal.style.display = "none";
};
depositAmount.addEventListener('keydown', function(e) {
  if (e.key === "Enter") makeDeposit();
});

// --- INIT ---
resetGame();
drawGrid(Array.from({length: ROWS}, ()=>Array.from({length: COLS}, randSymbol)));