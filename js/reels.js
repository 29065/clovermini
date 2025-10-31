import {getRandomSymbol} from './grid.js';
import {playReelSound} from './audio.js';

const rows = 3, cols = 5;

export function initReels(){
    const container = document.getElementById("reels");
    container.innerHTML = "";
    for(let c=0;c<cols;c++){
        const reel = document.createElement("div");
        reel.className = "reel";
        reel.id = `reel${c}`;
        container.appendChild(reel);
    }
    renderReels();
}

export function renderReels(){
    for(let c=0;c<cols;c++){
        const reelEl = document.getElementById(`reel${c}`);
        reelEl.innerHTML="";
        for(let r=0;r<rows;r++){
            const symEl = document.createElement("div");
            symEl.className="symbol";
            symEl.textContent = window.game.grid[r][c];
            reelEl.appendChild(symEl);
        }
    }
}

export function spinReels(){
    return new Promise(resolve => {
        let completed=0;
        for(let c=0;c<cols;c++){
            const reelEl = document.getElementById(`reel${c}`);
            let spins=0;
            const interval = setInterval(()=>{
                reelEl.scrollTop += 20;
                playReelSound();
                spins++;
                if(spins > 20 + c*5){ // staggered stop
                    clearInterval(interval);
                    // Set final symbols
                    for(let r=0;r<rows;r++){
                        window.game.grid[r][c] = getRandomSymbol();
                    }
                    renderReels();
                    completed++;
                    if(completed === cols) resolve();
                }
            },25);
        }
    });
}
