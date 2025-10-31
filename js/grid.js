export const symbols = ["🍋","🍒","🍀","🔔","💎","💰","7️⃣"];
const rows = 3;
const cols = 5;

export function initGrid() {
    window.game.grid = [];
    for(let r=0;r<rows;r++){
        const row=[];
        for(let c=0;c<cols;c++){
            row.push(symbols[Math.floor(Math.random()*symbols.length)]);
        }
        window.game.grid.push(row);
    }
}
