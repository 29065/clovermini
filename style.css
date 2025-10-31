const handle = document.getElementById('handle');
const reels = Array.from(document.getElementsByClassName('reel'));
const coinsEl = document.getElementById('coins');
const multiplierEl = document.getElementById('multiplier');
let coins = 1000;
let multiplier = 1;

// Symbols for visuals
const symbols = ["🍀", "⭐", "💎", "🔥", "🍒", "🍀"];

function createReelSymbols(reel) {
  reel.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const symbol = document.createElement('div');
    symbol.classList.add('symbol');
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    reel.appendChild(symbol);
  }
}

// Initial setup
reels.forEach(createReelSymbols);

// Spin Animation
handle.addEventListener('click', () => {
  // Animate handle
  handle.style.transform = "translateY(10px)";
  setTimeout(() => handle.style.transform = "translateY(-50%)", 200);

  reels.forEach((reel, idx) => {
    let spins = 20 + idx * 5; // staggered spins
    let interval = setInterval(() => {
      createReelSymbols(reel);
      spins--;
      if (spins <= 0) clearInterval(interval);
    }, 50 + idx * 20);
  });

  // Update coins & multiplier visually
  coins -= 10;
  coinsEl.textContent = coins;
});

// Charm shop toggle
const charmShopBtn = document.getElementById('charmShopBtn');
const charmShop = document.getElementById('charmShop');
const closeShop = document.getElementById('closeShop');

charmShopBtn.addEventListener('click', () => {
  charmShop.classList.remove('hidden');
});

closeShop.addEventListener('click', () => {
  charmShop.classList.add('hidden');
});
