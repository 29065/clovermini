// ==========================
// CLOVERMINI SLOT GAME LOGIC
// ==========================

const symbols = ["🍀", "🍋", "🍒", "⭐", "💎"]; // 💎 is jackpot
const symbolValues = {
    "🍀": 2,
    "🍋": 3,
    "🍒": 4,
    "⭐": 5,
    "💎": 50 // jackpot
};
const jackpotSymbol = "💎";

const rows = 3;
const cols = 5;

let coins = 100;

const slotsContainer = document.getElementById("slots");
const messageEl = document.getElementById("message");
const coinsEl = document.getElementById("coins");
const spinBtn = document.getElementById("spinBtn");

const lineCanvas = document.getElementById("lineCanvas");
const ctx = lineCanvas.getContext("2d");

lineCanvas.width = slotsContainer.offsetWidth;
lineCanvas.height = slotsContainer.offsetHeight;

let slotElements = [];

// INITIALIZE SLOTS
function initSlots() {
    slotsContainer.innerHTML = "";
    slotElements = [];
    for (let r = 0; r < rows; r++) {
        let rowEls = [];
        for (let c = 0; c < cols; c++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.textContent = getRandomSymbol();
            slotsContainer.appendChild(slot);
            rowEls.push(slot);
        }
        slotElements.push(rowEls);
    }
}

// RANDOM SYMBOL WITH JACKPOT CHANCE
function getRandomSymbol() {
    if (Math.random() < 0.05) return jackpotSymbol;
    return symbols[Math.floor(Math.random() * (symbols.length - 1))];
}

// SPIN FUNCTION
async function spin() {
    if (coins <= 0) {
        messageEl.textContent = "No coins left!";
        return;
    }
    coins--;
    updateCoins();

    messageEl.textContent = "Spinning...";
    clearLines();

    // Spin animation column by column
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            slotElements[r][c].classList.add("spinning");
        }
        await new Promise(res => setTimeout(res, 150)); // stagger columns
        for (let r = 0; r < rows; r++) {
            slotElements[r][c].textContent = getRandomSymbol();
            slotElements[r][c].classList.remove("spinning");
        }
    }

    checkPatterns();
}

// UPDATE COIN DISPLAY
function updateCoins() {
    coinsEl.textContent = coins;
}

// CLEAR PREVIOUS LINES
function clearLines() {
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
    slotElements.flat().forEach(slot => slot.classList.remove("winning", "jackpot"));
}

// DRAW LINE FOR WINNING PATTERN
function drawLine(pattern) {
    const slotSize = slotElements[0][0].offsetWidth;
    const gap = 10;
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const startSlot = slotElements[pattern[0].row][pattern[0].col];
    const endSlot = slotElements[pattern[pattern.length - 1].row][pattern[pattern.length - 1].col];
    const rect = slotsContainer.getBoundingClientRect();

    const startX = startSlot.offsetLeft + slotSize / 2;
    const startY = startSlot.offsetTop + slotSize / 2;
    const endX = endSlot.offsetLeft + slotSize / 2;
    const endY = endSlot.offsetTop + slotSize / 2;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

// FLOATING COINS
function floatCoins(x, y, amount) {
    for (let i = 0; i < amount; i++) {
        const coin = document.createElement("div");
        coin.classList.add("coin");
        coin.textContent = "🪙";
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        document.body.appendChild(coin);
        coin.addEventListener("animationend", () => coin.remove());
    }
}

// CHECK WINNING PATTERNS
function checkPatterns() {
    const patterns = [];
    const used = Array.from({ length: rows }, () => Array(cols).fill(false));

    // Helper function to check line in any direction
    function checkLine(r, c, dr, dc) {
        const symbol = slotElements[r][c].textContent;
        const pattern = [{ row: r, col: c }];
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < rows && nc >= 0 && nc < cols && slotElements[nr][nc].textContent === symbol) {
            pattern.push({ row: nr, col: nc });
            nr += dr;
            nc += dc;
        }
        if (pattern.length >= 3) return pattern;
        return null;
    }

    // Directions: right, down, diag down-right, diag down-left
    const directions = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 }
    ];

    let totalWin = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            directions.forEach(dir => {
                const pattern = checkLine(r, c, dir.dr, dir.dc);
                if (pattern) {
                    patterns.push(pattern);
                    pattern.forEach(p => {
                        slotElements[p.row][p.col].classList.add("winning");
                        if (slotElements[p.row][p.col].textContent === jackpotSymbol) {
                            slotElements[p.row][p.col].classList.add("jackpot");
                        }
                    });
                    const symbol = slotElements[r][c].textContent;
                    const winAmount = pattern.length * symbolValues[symbol];
                    totalWin += winAmount;

                    const firstSlot = slotElements[pattern[0].row][pattern[0].col];
                    floatCoins(firstSlot.offsetLeft + firstSlot.offsetWidth/2, firstSlot.offsetTop, pattern.length);
                    drawLine(pattern);
                }
            });
        }
    }

    if (totalWin > 0) {
        coins += totalWin;
        messageEl.textContent = `You won ${totalWin} coins!`;
    } else {
        messageEl.textContent = "No win this time!";
    }
    updateCoins();
}

// INITIALIZE GAME
initSlots();
updateCoins();

spinBtn.addEventListener("click", spin);
