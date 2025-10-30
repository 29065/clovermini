// SYMBOLS AND BUFFS
const SYMBOLS = [
  { name: "lemon", display: "🍋", value: 1 },
  { name: "cherry", display: "🍒", value: 1 },
  { name: "clover", display: "🍀", value: 2 },
  { name: "bell", display: "🔔", value: 2 },
  { name: "diamond", display: "💎", value: 5 },
  { name: "treasure", display: "🪙", value: 6 },
  { name: "seven", display: "7️⃣", value: 7 }
];

const BUFFS = [
  {
    label: "All winnings +1 per symbol this round",
    id: "plus1",
    effect: prize => prize + 3 // +1 per symbol for a 3-symbol slot
  },
  {
    label: "Next deposit earns double coins (once)",
    id: "doubleDeposit",
    effect: null // handled on deposit
  },
  {
    label: "Increased chance for high-value symbols",
    id: "highChance",
    effect: null // handled in slot machine
  }
];

// CHARMS
const CHARMS = [
  {
    id: "lucky-star",
    name: "Lucky Star",
    desc: "All slot rewards +1.",
    cost: 7,
    effect: "slot_plus1"
  },
  {
    id: "double-cherry",
    name: "Double Cherry",
    desc: "Cherry is worth double.",
    cost: 8,
    effect: "cherry_double"
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    desc: "Lemon is worth double.",
    cost: 8,
    effect: "lemon_double"
  },
  {
    id: "jackpot-magnet",
    name: "Jackpot Magnet",
    desc: "7's are much more likely.",
    cost: 10,
    effect: "seven_high"
  },
  {
    id: "bell-ringer",
    name: "Bell Ringer",
    desc: "Get +2 extra coins for every bell.",
    cost: 6,
    effect: "bell_bonus"
  },
  {
    id: "gem-fan",
    name: "Gem Fan",
    desc: "Diamond is worth double.",
    cost: 9,
    effect: "diamond_double"
  },
  {
    id: "chest-finder",
    name: "Chest Finder",
    desc: "Treasure Chest is worth double.",
    cost: 9,
    effect: "treasure_double"
  },
  {
    id: "clover-boost",
    name: "Clover Boost",
    desc: "Clover is worth double.",
    cost: 8,
    effect: "clover_double"
  },
  {
    id: "extra-spin",
    name: "Extra Spin",
    desc: "Get 1 extra slot spin per round.",
    cost: 12,
    effect: "extra_spin"
  },
  {
    id: "ticket-doubler",
    name: "Ticket Doubler",
    desc: "Double tickets from any source.",
    cost: 12,
    effect: "ticket_double"
  }
];

const STARTING_COINS = 0;
const STARTING_TICKETS = 0;
const ROUNDS_PER_RUN = 3;
const REQUIREMENT_BASE = 50;
const REQUIREMENT_SCALE = 1.5;

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
  extraSpinUsed: false
};

// DOM ELEMENTS
const runNumber = document.getElementById('run-number');
const roundNumber = document.getElementById('round-number');
const coinBalance = document.getElementById('coin-balance');
const ticketBalance = document.getElementById('ticket-balance');
const coinRequirement = document.getElementById('coin-requirement');
const coinsDeposited = document.getElementById('coins-deposited');
const status = document.getElementById('status');
const slotBtn = document.getElementById('play-slot');
const startBtn = document.getElementById('start-run');
const depositSection = document.getElementById('deposit-section');
const depositAmount = document.getElementById('deposit-amount');
const makeDepositBtn = document.getElementById('make-deposit');
const slotResult = document.getElementById('slot-result');
const slotSymbols = document.getElementById('slot-symbols');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart');
const phoneCallModal = document.getElementById('phone-call-modal');
const buffOptions = document.getElementById('buff-options');
const activeBuff = document.getElementById('active-buff');
const charmInventory = document.getElementById('charm-inventory');
const shopList = document.getElementById('shop-list');
const shopMessage = document.getElementById('shop-message');

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabs = {
  slot: document.getElementById("slot-tab"),
  shop: document.getElementById("shop-tab"),
  deposit: document.getElementById("deposit-tab"),
};

// Tab logic
tabBtns.forEach(btn => {
  btn.onclick = () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    Object.values(tabs).forEach(tab => tab.classList.remove("active"));
    btn.classList.add("active");
    tabs[btn.dataset.tab].classList.add("active");
  };
});
// Default to slot tab
document.getElementById('tab-slot').classList.add('active');
tabs.slot.classList.add('active');

// UTILS
function randInt(max) {
  return Math.floor(Math.random() * max);
}
function pickRandom(array) {
  return array[randInt(array.length)];
}
function hasCharm(effectId) {
  return gameState.inventory.some(c=>c.effect===effectId);
}

// GAME RESET/START
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
    extraSpinUsed: false
  };
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
  status.textContent = 'New run started! Play the slot machine to begin Round 1.';
  startBtn.disabled = true;
  slotBtn.disabled = false;
  depositAmount.value = "";
  slotSymbols.textContent = "";
  slotResult.textContent = "";
  activeBuff.textContent = "";
  gameOverScreen.style.display = 'none';
  updateUI();
}

// ROUND START & PHONE CALL BUFF
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
  slotBtn.disabled = true;
  slotSymbols.textContent = "";
  slotResult.textContent = "";
  // Show phone call (buff) modal
  showPhoneCall();
  updateUI();
}

function showPhoneCall() {
  // Pick 3 different buffs
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

// Buff selection
function selectBuff(buff) {
  gameState.buff = buff;
  gameState.buffDesc = buff.label;
  if (buff.id === "doubleDeposit") {
    gameState.doubleDepositPending = true;
  }
  phoneCallModal.style.display = "none";
  status.textContent = `Round ${gameState.round} started! Buff: ${buff.label}`;
  slotBtn.disabled = false;
  updateUI();
}

// SLOT MACHINE
function playSlot() {
  if (!gameState.roundActive) startRound();
  let symbols = [];
  let prize = 0;
  let extraTickets = 0;
  // Buff: highChance makes high-value symbols more likely
  let symbolPool = SYMBOLS;
  // Charms can affect symbol weights
  if ((gameState.buff && gameState.buff.id === "highChance") || hasCharm("seven_high")) {
    symbolPool = [
      ...SYMBOLS.slice(0,2),            // lemon, cherry (each x1)
      ...SYMBOLS.slice(2,4),            // clover, bell (each x2)
      ...SYMBOLS.slice(4,7),            // diamond, treasure, 7 (each x3)
      ...SYMBOLS.slice(4,7)             // diamond, treasure, 7 (each x3 again)
    ];
  }
  for (let i=0; i<3; ++i) {
    let sym = pickRandom(symbolPool);
    let val = sym.value;
    // Charms that double symbol value
    if (sym.name==="lemon" && hasCharm("lemon_double")) val *= 2;
    if (sym.name==="cherry" && hasCharm("cherry_double")) val *= 2;
    if (sym.name==="clover" && hasCharm("clover_double")) val *= 2;
    if (sym.name==="bell" && hasCharm("bell_bonus")) val += 2;
    if (sym.name==="diamond" && hasCharm("diamond_double")) val *= 2;
    if (sym.name==="treasure" && hasCharm("treasure_double")) val *= 2;
    if (sym.name==="seven" && hasCharm("seven_high")) val = Math.max(val, 9); // 7's are worth at least 9
    // Buffs
    if (gameState.buff && gameState.buff.id === "plus1") val += 1;
    if (hasCharm("slot_plus1")) val += 1;
    symbols.push({...sym, value: val });
    prize += val;
  }
  // Tickets: 1 ticket per 20 coins won (rounded down), doubled with charm
  let ticketEarn = Math.floor(prize / 20);
  if (hasCharm("ticket_double")) ticketEarn *= 2;
  gameState.tickets += ticketEarn;
  // Buff: +1 per symbol (already added above)
  // Show result
  slotSymbols.textContent = symbols.map(s => s.display).join(" ");
  slotResult.textContent = `You won ${prize} coins!${ticketEarn ? ` +${ticketEarn} ticket${ticketEarn>1?'s':''}` : ''}`;
  gameState.coins += prize;

  // Extra spin charm: one extra slot per round
  if (hasCharm("extra_spin") && !gameState.extraSpinUsed) {
    gameState.extraSpinUsed = true;
    slotBtn.disabled = false;
    status.textContent = "Extra spin from charm! (One per round)";
  } else {
    slotBtn.disabled = true;
    status.textContent = "Go deposit coins or advance round!";
  }

  updateUI();
}

// DEPOSIT
function makeDeposit() {
  const amt = parseInt(depositAmount.value, 10);
  if (isNaN(amt) || amt <= 0) {
    status.textContent = 'Enter a valid deposit amount.';
    return;
  }
  if (amt > gameState.coins) {
    status.textContent = 'Not enough coins!';
    return;
  }
  let depositTotal = amt;
  // Buff: doubleDeposit
  if (gameState.buff && gameState.buff.id === "doubleDeposit" && gameState.doubleDepositPending) {
    depositTotal *= 2;
    gameState.doubleDepositPending = false;
    status.textContent = `Deposited ${amt} coins (doubled to ${depositTotal})!`;
  } else {
    status.textContent = `Deposited ${amt} coins!`;
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
  status.textContent = `Round ${gameState.round} complete! Play slot machine to start next round.`;
  slotBtn.disabled = false;
  gameState.roundActive = false;
  activeBuff.textContent = "";
  // End run if finished 3 rounds
  if (gameState.round >= ROUNDS_PER_RUN) {
    status.textContent = 'Congratulations! You finished all rounds of this run!';
    gameOverScreen.style.display = 'block';
    slotBtn.disabled = true;
    startBtn.disabled = false;
    gameState.active = false;
  }
  updateUI();
}

// SHOP
function renderShop() {
  shopList.innerHTML = "";
  CHARMS.forEach(charm => {
    // Don't show if already owned
    const owned = gameState.inventory.some(c => c.id === charm.id);
    const div = document.createElement("div");
    div.className = "shop-charm";
    div.innerHTML = `<div class="info">
      <b>${charm.name}</b> <span style="color:#888;">(${charm.cost} tickets)</span><br>
      <span style="font-size:0.95em">${charm.desc}</span>
    </div>`;
    const btn = document.createElement("button");
    btn.className = "buy-btn";
    btn.disabled = owned || gameState.tickets < charm.cost;
    btn.textContent = owned ? "Owned" : "Buy";
    btn.onclick = () => {
      if (gameState.tickets >= charm.cost && !owned) {
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

// INVENTORY
function renderInventory() {
  charmInventory.innerHTML = "";
  if (gameState.inventory.length === 0) {
    charmInventory.innerHTML = "<li>No charms yet</li>";
    return;
  }
  gameState.inventory.forEach(charm => {
    let li = document.createElement("li");
    li.textContent = `${charm.name}: ${charm.desc}`;
    charmInventory.appendChild(li);
  });
}

// UI UPDATE
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
  if (gameState.gameOver) {
    slotBtn.disabled = true;
    startBtn.disabled = false;
    gameOverScreen.style.display = 'block';
  }
}

// GAME OVER HANDLING
function gameOver() {
  gameState.gameOver = true;
  gameState.active = false;
  status.textContent = `Game Over! You did not deposit enough coins in time.`;
  updateUI();
}

function restart() {
  gameState.run += 1;
  startRun();
}

// EVENT LISTENERS
startBtn.addEventListener('click', startRun);
slotBtn.addEventListener('click', playSlot);
makeDepositBtn.addEventListener('click', makeDeposit);
restartBtn.addEventListener('click', restart);

// Modal close by click outside
window.onclick = function(event) {
  if (event.target === phoneCallModal) phoneCallModal.style.display = "none";
};

// Initial UI
resetGame();