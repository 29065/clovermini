export function updateUI(){
    document.getElementById("spinsLeft").innerText = window.game.spinsLeft;
    document.getElementById("tickets").innerText = window.game.tickets;
    document.getElementById("round").innerText = window.game.round;
    document.getElementById("deadline").innerText = window.game.deadline;
}
