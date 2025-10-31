export const symbols = ["🍀","7️⃣","💎","🍒","⭐","🍋"];

export function initGrid() {
    const rows = 3, cols = 5;
    window.game.grid = [];
    for(let r=0;r<rows;r++){
        const row=[];
        for(let c=0;c<cols;c++){
            row.push(symbols[Math.floor(Math.random()*symbols.length)]);
        }
        window.game.grid.push(row);
    }
}

export function getRandomSymbol() {
    return symbols[Math.floor(Math.random()*symbols.length)];
}
