import {initReels, spinReels} from './reels.js';
import {initGrid} from './grid.js';
import {initCharmShop} from './charms.js';
import {updateUI} from './ui.js';

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

// Handle click
document.getElementById("handle").addEventListener("click", () => {
    if(game.spinsLeft <= 0) return alert("No spins left!");
    game.spinsLeft--;
    spinReels().then(() => {
        // Pattern detection & charm effects can go here
        updateUI();
    });
});
