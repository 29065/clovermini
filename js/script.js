// --- GAME STATE ---
let balance = 1000;
let lastWin = 0;

const reels = [];
for(let i=0;i<5;i++){
    reels.push(document.getElementById(`reel${i}`));
}

// --- CHARMS SETUP ---
const charmContainer = document.getElementById("charms-container");
const charms = [
    {name:"Lucky Clover", effect:"Increase chance of 🍀", apply:()=> modifySymbolChance("🍀",0.1)},
    {name:"Golden Star", effect:"Increase ⭐ payout", apply:()=> addMultiplier("⭐",1.5)},
    {name:"Diamond Charm", effect:"Extra 💎 multiplier", apply:()=> addMultiplier("💎",2)},
    {name:"Cherry Bomb", effect:"Chance for extra 🍒", apply:()=> modifySymbolChance("🍒",0.1)},
    {name:"7️⃣ Booster", effect:"7️⃣ more likely", apply:()=> modifySymbolChance("7️⃣",0.05)},
    {name:"Jackpot Charm", effect:"Small chance jackpot spin", apply:()=> enableJackpot()}
];

let activeCharms = [];

charms.forEach(charm=>{
    const div = document.createElement("div");
    div.classList.add("charm");
    div.textContent = charm.name;
    div.title = charm.effect;
    div.addEventListener("click", ()=>{
        if(!activeCharms.includes(charm)){
            activeCharms.push(charm);
            div.classList.add("active");
            charm.apply();
        }
    });
    charmContainer.appendChild(div);
});

// --- SYMBOL PROBABILITY MODIFIERS ---
let symbolModifiers = {};

function modifySymbolChance(symbol, bonus){
    if(!symbolModifiers[symbol]) symbolModifiers[symbol] = 0;
    symbolModifiers[symbol] += bonus;
}

// --- MULTIPLIERS ---
let multipliers = {};
function addMultiplier(symbol, value){
    if(!multipliers[symbol]) multipliers[symbol] = 1;
    multipliers[symbol] *= value;
}

// --- JACKPOT ---
let jackpotEnabled = false;
function enableJackpot(){
    jackpotEnabled = true;
}

// --- RANDOM SYMBOL GENERATOR WITH CHARMS ---
function getRandomSymbol() {
    const symbols = ["🍀","7️⃣","💎","🍒","⭐","🍋"];
    let baseWeights = [0.1,0.05,0.1,0.25,0.2,0.3];

    // Apply charm modifiers
    for(let i=0;i<symbols.length;i++){
        if(symbolModifiers[symbols[i]]) baseWeights[i] += symbolModifiers[symbols[i]];
    }

    let total = baseWeights.reduce((a,b)=>a+b,0);
    let rand = Math.random()*total;
    for(let i=0;i<symbols.length;i++){
        if(rand < baseWeights[i]) return symbols[i];
        rand -= baseWeights[i];
    }
    return symbols[symbols.length-1];
}

// --- WIN EVALUATION WITH MULTIPLIERS ---
function calculateWin(symbol, count){
    let basePayout = 0;
    switch(symbol){
        case "🍀": basePayout=10; break;
        case "7️⃣": basePayout=50; break;
        case "💎": basePayout=30; break;
        case "🍒": basePayout=5; break;
        case "⭐": basePayout=15; break;
        case "🍋": basePayout=2; break;
    }
    let multiplier = multipliers[symbol] || 1;
    return basePayout * count * multiplier;
}

// --- SPIN FUNCTION ---
async function spinReels(){
    const rows = 3;
    const cols = 5;

    // Animate reels
    for(let c=0;c<cols;c++){
        reels[c].innerHTML = "";
        for(let r=0;r<rows;r++){
            const symbol = getRandomSymbol();
            const div = document.createElement("div");
            div.textContent = symbol;
            reels[c].appendChild(div);
        }
    }

    await sleep(500); // simulate spin duration

    // Check wins (simple horizontal lines)
    let totalWin = 0;
    for(let r=0;r<rows;r++){
        let firstSymbol = reels[0].children[r].textContent;
        let matchCount = 1;
        for(let c=1;c<cols;c++){
            if(reels[c].children[r].textContent === firstSymbol) matchCount++;
            else break;
        }
        if(matchCount>=3){
            totalWin += calculateWin(firstSymbol, matchCount);
        }
    }

    lastWin = totalWin;
    balance += totalWin - 10; // 10 cost per spin

    document.getElementById("balance").textContent = `Balance: ${balance}`;
    document.getElementById("win").textContent = `Last Win: ${lastWin}`;
}

// --- UTILITY ---
function sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

// --- HANDLE CLICK ---
const handle = document.getElementById("handle");
handle.addEventListener("click", async ()=>{
    handle.style.transform = "translateY(20px)";
    await sleep(200);
    handle.style.transform = "translateY(0)";
    spinReels();
});

// --- BUTTON CLICK ---
document.getElementById("spinBtn").addEventListener("click", spinReels);
