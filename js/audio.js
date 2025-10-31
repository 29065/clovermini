let spinAudio = new Audio("sounds/spin.mp3");
let winAudio = new Audio("sounds/win.mp3");
let reelAudio = new Audio("sounds/reel.mp3");

export function playSpinSound(){ spinAudio.currentTime=0; spinAudio.play(); }
export function playWinSound(){ winAudio.currentTime=0; winAudio.play(); }
export function playReelSound(){ reelAudio.currentTime=0; reelAudio.play(); }
