import {initGrid} from './grid.js';
import {initReels, spinReels} from './reels.js';
import {initCharmShop} from './charms.js';
import {updateUI} from './ui.js';
import {detectPatterns, resolvePatterns} from './patterns.js';
import {playSpinSound, playWinSound} from './audio.js';
import {animateHandle} from './animation.js';

window.game = {
    grid: [],
    spinsLeft: 5,
    tickets: 0,
    round: 1,
    deadline: 1,
    debt: 50,
    charms: [],
};

// Initialize
initGrid();
initReels();
initCharmShop();
updateUI();

// Main spin flow
export async function spinGame() {
    if(window.game.spinsLeft <= 0){
        alert("No spins left!");
        return;
    }
    window.game.spinsLeft--;
    updateUI();

    // Animate handle
    animateHandle();

    // Spin reels
    await spinReels();

    // Detect patterns and calculate tickets
    const patterns = detectPatterns(window.game.grid);
    const ticketsWon = resolvePatterns(patterns, window.game.charms);
    if(ticketsWon>0) playWinSound();
    window.game.tickets += ticketsWon;

    // Round & Deadline Logic
    window.game.round++;
    if(window.game.round > window.game.deadline){
        if(window.game.tickets < window.game.debt){
            alert("Deadline missed! Debt increases.");
            window.game.debt += 50;
        }
        window.game.round = 1;
        window.game.deadline++;
    }

    updateUI();
}

// Handle events
document.getElementById("spinBtn").addEventListener("click", spinGame);
document.getElementById("handle").addEventListener("click", spinGame);
