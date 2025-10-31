const reels = [...document.querySelectorAll('.reel')];
const handle = document.getElementById('handle');
const coinDisplay = document.getElementById('coinCount');
const multiplierDisplay = document.getElementById('multiplier');
let coins = 1000;
let multiplier = 1;

// Symbols
const symbols = ['🍀','💎','⭐','🔔','🍒','💰','🔥'];
const symbolWeights = [20, 10, 15, 15, 25, 10, 5]; // for rarity

// Charm Shop
const charmShopBtn = document.getElementById('openCharmShop');
const charmShopModal = document.getElementById('charmShopModal');
const closeModal = document.querySelector('.close');

charmShopBtn.onclick = () => charmShopModal.style.display = 'block';
closeModal.onclick = () => charmShopModal.style.display = 'none';
window.onclick = (e) => { if(e.target === charmShopModal) charmShopModal.style.display = 'none'; }

document.querySelectorAll('.charm').forEach(button => {
    button.onclick = () => {
        const cost = parseInt(button.dataset.cost);
        const effect = button.dataset.effect;
        if(coins >= cost){
            coins -= cost;
            coinDisplay.textContent = coins;
            if(effect === 'multiplier') multiplier += 1;
            if(effect === 'autospin') autoSpin(5);
            if(effect === 'extraSpin') spin();
        } else alert('Not enough coins!');
    }
});

// Helper function to pick a weighted random symbol
function pickSymbol() {
    let total = symbolWeights.reduce((a,b)=>a+b,0);
    let r = Math.random()*total;
    for(let i=0;i<symbols.length;i++){
        if(r < symbolWeights[i]) return symbols[i];
        r -= symbolWeights[i];
    }
    return symbols[0];
}

// Animate handle
function animateHandle() {
    handle.style.transform = 'translateY(20px)';
    setTimeout(() => handle.style.transform = 'translateY(0px)', 200);
}

// Spin a single reel
function spinReel(reel) {
    return new Promise(resolve => {
        const spinCount = 20 + Math.floor(Math.random()*10);
        let symbolsHTML = '';
        for(let i=0;i<spinCount;i++){
            symbolsHTML += `<div class="symbol">${pickSymbol()}</div>`;
        }
        reel.innerHTML = symbolsHTML;

        // Animate scrolling
        reel.scrollTop = 0;
        let step = 0;
        let totalSteps = spinCount*80;
        const interval = setInterval(()=>{
            reel.scrollTop += 40;
            step += 40;
            if(step >= totalSteps){
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });
}

// Spin all reels
async function spin() {
    if(coins < 10) { alert('Not enough coins to spin!'); return; }
    coins -= 10;
    coinDisplay.textContent = coins;
    animateHandle();
    multiplierDisplay.textContent = 'x'+multiplier;
    for(let i=0;i<reels.length;i++){
        await spinReel(reels[i]);
    }
    checkWin();
}

// Auto-spin function
function autoSpin(count) {
    if(count <= 0) return;
    spin();
    setTimeout(()=>autoSpin(count-1), 1000);
}

// Check for matches (simplified horizontal only)
function checkWin() {
    let winCoins = 0;
    for(let r=0;r<3;r++){
        let rowSymbols = reels.map(reel => reel.children[r]?.textContent);
        let counts = {};
        rowSymbols.forEach(s=>counts[s]=(counts[s]||0)+1);
        Object.values(counts).forEach(c=>{
            if(c>=3) winCoins += 50 * c * multiplier;
        });
    }
    if(winCoins > 0){
        coins += winCoins;
        coinDisplay.textContent = coins;
        alert('You won '+winCoins+' coins!');
    }
}

// Handle click
handle.onclick = spin;
