// -------------------------------
// Symbols
// -------------------------------
const symbols = ["🍋","🍒","🍀","🔔","💎","💰","7️⃣"];
const gridRows = 3, gridCols = 5;

// -------------------------------
// Game state
// -------------------------------
let game = {
    grid: [[],[],[]],
    spinsLeft: 5,
    tickets: 0,
    round: 1,
    deadline: 1,
    debt: 50,
    charms: [],
};

// -------------------------------
// Fill grid randomly
// -------------------------------
function fillGrid() {
    for(let r=0;r<gridRows;r++){
        game.grid[r]=[];
        for(let c=0;c<gridCols;c++){
            game.grid[r].push(symbols[Math.floor(Math.random()*symbols.length)]);
        }
    }
}

// -------------------------------
// Update UI
// -------------------------------
function updateUI(){
    document.getElementById("spinsLeft").innerText = game.spinsLeft;
    document.getElementById("tickets").innerText = game.tickets;
    document.getElementById("round").innerText = game.round;
    document.getElementById("deadline").innerText = game.deadline;
    renderReels();
}

// -------------------------------
// Render reels (animated)
function renderReels(){
    for(let c=0;c<gridCols;c++){
        const reelEl = document.getElementById("reel"+c);
        reelEl.innerHTML="";
        for(let r=0;r<gridRows;r++){
            const symEl = document.createElement("div");
            symEl.className="symbol";
            symEl.innerText = game.grid[r][c];
            reelEl.appendChild(symEl);
        }
    }
}

// -------------------------------
// Spin animation
function spin(){
    if(game.spinsLeft<=0) return alert("No spins left!");

    game.spinsLeft--;

    // Animate each reel
    for(let c=0;c<gridCols;c++){
        const reelEl = document.getElementById("reel"+c);
        let spins=0;
        const interval = setInterval(()=>{
            reelEl.scrollTop += 20;
            spins++;
            if(spins>15+c*5){ // stagger stop
                clearInterval(interval);
                reelEl.scrollTop=0;
                fillGrid();
                renderReels();
            }
        },30);
    }

    // Update tickets randomly for demo
    game.tickets += Math.floor(Math.random()*10+1);

    // Round & deadline logic
    game.round++;
    if(game.round>3){
        if(game.tickets<game.debt){
            alert("Deadline missed! Game Over");
            resetGame();
            return;
        } else {
            game.round=1;
            game.deadline++;
            game.debt +=50;
        }
    }

    updateUI();
}

// -------------------------------
// Handle
document.getElementById("handle").addEventListener("click",spin);

// -------------------------------
// Charm shop (demo)
const charmShop = document.getElementById("charmShop");
const charmList = [
    {id:"Lucky Cat", cost:1}, 
    {id:"Horseshoe", cost:3},
    {id:"Ankh", cost:2},
];

charmList.forEach(c=>{
    const el = document.createElement("div");
    el.className="charm";
    el.innerText = `${c.id} (${c.cost})`;
    el.onclick = ()=>{
        if(game.tickets>=c.cost && !game.charms.includes(c.id)){
            game.tickets -= c.cost;
            game.charms.push(c.id);
            el.classList.add("sold");
            updateUI();
        }
    };
    charmShop.appendChild(el);
});

// -------------------------------
// Reset
function resetGame(){
    game={
        grid:[[],[],[]],
        spinsLeft:5,
        tickets:0,
        round:1,
        deadline:1,
        debt:50,
        charms:[],
    };
    updateUI();
}

// -------------------------------
// Init
fillGrid();
updateUI();
import {detectPatterns, resolvePatterns} from './patterns.js';

document.getElementById("handle").addEventListener("click", () => {
    if(game.spinsLeft <= 0) return alert("No spins left!");
    game.spinsLeft--;
    spinReels().then(() => {
        const wins = detectPatterns(game.grid);
        const tickets = resolvePatterns(wins);

        // Apply charm effects
        game.charms.forEach(c=>{
            if(c==="Lucky Cat") game.tickets += Math.floor(tickets*0.5);
            if(c==="Four Leaf Clover") game.tickets += 5; // flat bonus
        });

        game.tickets += tickets;
        game.round++;
        if(game.round > game.deadline){
            alert("Deadline reached! Debt increases.");
            // Implement debt logic here
        }

        updateUI();
    });
});
