// -------------------------
// ELEMENTS
// -------------------------
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab');
const balanceEl = document.getElementById('balance');
const spinBalanceEl = document.getElementById('spin-balance');
const slotGrid = document.querySelector('.slot-grid');
const slotSpinBtn = document.querySelector('.slot-spin-btn');
const slotRunBtn = document.querySelector('.slot-run-btn');
const inventoryList = document.getElementById('inventory-list');
const spinPackBtn = document.querySelector('.spin-pack-btn');
const modal = document.getElementById('cryptic-modal');
const crypticCloseBtn = document.getElementById('cryptic-close');

// -------------------------
// STATE
// -------------------------
let balance = 1000;          // User money
let spins = 0;               // Spins balance
let inventory = [];          // Won items
let spinCost = 50;           // Each spin costs $50
let packCost = 200;          // Spin pack cost
let packSpins = 5;           // Spins per pack

// Items by rarity
const items = [
  { name: 'Copper Coin', rarity: 'common' },
  { name: 'Silver Ring', rarity: 'rare' },
  { name: 'Magic Scroll', rarity: 'epic' },
  { name: 'Dragon Egg', rarity: 'legendary' }
];

// Probability weights: common > rare > epic > legendary
const weights = {
  common: 0.6,
  rare: 0.25,
  epic: 0.1,
  legendary: 0.05
};

// Buffs (from phone call)
let buffs = {
  bonusSpin: 0,   // Extra free spins
  doubleReward: false
};

// -------------------------
// TAB SWITCHING
// -------------------------
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// -------------------------
// HELPER FUNCTIONS
// -------------------------
function updateBalances() {
  balanceEl.textContent = balance;
  spinBalanceEl.textContent = spins;
}

function updateInventory() {
  inventoryList.innerHTML = '';
  inventory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.className = `rarity-${item.rarity}`;
    inventoryList.appendChild(li);
  });
}

function getRandomItem() {
  // Select rarity by weighted chance
  const rand = Math.random();
  let cumulative = 0;
  let chosenRarity = 'common';
  for (const rarity in weights) {
    cumulative += weights[rarity];
    if (rand <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }
  // Filter items of that rarity
  const filtered = items.filter(i => i.rarity === chosenRarity);
  const selected = filtered[Math.floor(Math.random() * filtered.length)];
  return selected;
}

// -------------------------
// SLOT MACHINE SPIN
// -------------------------
function spinSlots() {
  if (spins <= 0) return alert('No spins left!');
  spins--;
  updateBalances();

  // Clear previous
  slotGrid.innerHTML = '';

  // Generate 3x3 grid
  const results = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'slot-cell';
    const item = getRandomItem();
    results.push(item);
    cell.textContent = item.name;
    cell.classList.add(`rarity-${item.rarity}`);
    slotGrid.appendChild(cell);
  }

  // Check winning pattern (middle row)
  const middleRow = results.slice(3, 6);
  const allSame = middleRow.every(i => i.name === middleRow[0].name);
  if (allSame) {
    let reward = 100;
    if (buffs.doubleReward) reward *= 2; // Buff doubles reward
    balance += reward;
    inventory.push(middleRow[0]);
    updateBalances();
    updateInventory();
    playSound('win');
  } else {
    playSound('spin');
  }
}

// -------------------------
// RUN MULTIPLE SPINS
// -------------------------
function runSpins(times) {
  if (spins < times) return alert('Not enough spins!');
  for (let i = 0; i < times; i++) {
    spinSlots();
  }
}

// -------------------------
// BUY SPIN PACK
// -------------------------
function buySpinPack() {
  if (balance < packCost) return alert('Not enough money!');
  balance -= packCost;
  spins += packSpins;
  updateBalances();
}

// -------------------------
// CRYPTIC MODAL (PHONE CALL)
// -------------------------
function showModal() {
  modal.style.display = 'block';

  // Apply random buff
  const rand = Math.random();
  if (rand < 0.5) {
    buffs.bonusSpin += 2; // 2 free spins
    alert('Phone call bonus: +2 free spins!');
  } else {
    buffs.doubleReward = true; // Double rewards
    alert('Phone call bonus: Double rewards active for next spin!');
  }
}

crypticCloseBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// -------------------------
// SOUND EFFECTS (base64)
// -------------------------
const sounds = {
  spin: new Audio('data:audio/wav;base64,UklGRh...'),  // placeholder
  win: new Audio('data:audio/wav;base64,UklGRh...')
};

function playSound(name) {
  if (sounds[name]) sounds[name].play();
}

// -------------------------
// EVENT LISTENERS
// -------------------------
slotSpinBtn.addEventListener('click', spinSlots);
slotRunBtn.addEventListener('click', () => runSpins(5));
spinPackBtn.addEventListener('click', buySpinPack);
document.getElementById('cryptic-btn').addEventListener('click', showModal);

// -------------------------
// INITIALIZE
// -------------------------
updateBalances();
updateInventory();
