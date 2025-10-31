const winningPatterns = [
    [ [0,0],[0,1],[0,2],[0,3],[0,4] ], // top row
    [ [1,0],[1,1],[1,2],[1,3],[1,4] ], // middle row
    [ [2,0],[2,1],[2,2],[2,3],[2,4] ], // bottom row
];

const payouts = {
    "🍀":10,
    "7️⃣":50,
    "💎":30,
    "🍒":5,
    "⭐":15,
    "🍋":2
};

export function detectPatterns(grid){
    const wins = [];
    for(const pattern of winningPatterns){
        const first = grid[pattern[0][0]][pattern[0][1]];
        if(pattern.every(([r,c])=>grid[r][c]===first)){
            wins.push({symbol:first, positions:pattern});
        }
    }
    return wins;
}

export function resolvePatterns(patterns, charms=[]){
    let tickets=0;
    patterns.forEach(p=>{
        let multiplier=1;
        charms.forEach(c=>{
            if(c==="Lucky Clover" && p.symbol==="🍀") multiplier+=0.2;
            if(c==="7️⃣ Booster" && p.symbol==="7️⃣") multiplier+=0.5;
            if(c==="Diamond Charm" && p.symbol==="💎") multiplier+=1;
        });
        tickets += payouts[p.symbol]*multiplier;
    });
    return Math.floor(tickets);
}
