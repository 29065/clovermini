import {symbols} from './grid.js';

const rows = 3;
const cols = 5;
const reelsContainer = document.getElementById('reelsContainer');

export function initReels(){
    reelsContainer.innerHTML = "";
    for(let c=0;c<cols;c++){
        const reel = document.createElement('div');
        reel.className='reel';
        reel.id = `reel${c}`;
        reelsContainer.appendChild(reel);
    }
    renderReels();
}

export function renderReels() {
    for(let c=0;c<cols;c++){
        const reelEl = document.getElementById('reel'+c);
        reelEl.innerHTML="";
        for(let r=0;r<rows;r++){
            const symEl = document.createElement("div");
            symEl.className="symbol";
            symEl.innerText = window.game.grid[r][c];
            reelEl.appendChild(symEl);
        }
    }
}

export function spinReels(){
    return new Promise(resolve => {
        let spinsCompleted = 0;
        for(let c=0;c<cols;c++){
            const reelEl = document.getElementById('reel'+c);
            let spinCount = 0;
            const interval = setInterval(()=>{
                reelEl.scrollTop += 20;
                spinCount++;
                if(spinCount>15+c*5){
                    clearInterval(interval);
                    // Assign new symbols
                    for(let r=0;r<rows;r++){
                        window.game.grid[r][c] = symbols[Math.floor(Math.random()*symbols.length)];
                    }
                    renderReels();
                    spinsCompleted++;
                    if(spinsCompleted===cols) resolve();
                }
            },30);
        }
    });
}
