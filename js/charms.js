export function initCharmShop(){
    const charmShop = document.getElementById("charmShop");
    const charmList = [
        {id:"Lucky Cat", cost:1}, 
        {id:"Horseshoe", cost:3},
        {id:"Ankh", cost:2},
        {id:"Four Leaf Clover", cost:4},
        {id:"Gold Coin", cost:5},
        {id:"Magic Lamp", cost:6}
    ];

    charmList.forEach(c=>{
        const el = document.createElement("div");
        el.className="charm";
        el.innerText = `${c.id} (${c.cost})`;
        el.onclick = ()=>{
            if(window.game.tickets>=c.cost && !window.game.charms.includes(c.id)){
                window.game.tickets -= c.cost;
                window.game.charms.push(c.id);
                el.classList.add("sold");
            }
        };
        charmShop.appendChild(el);
    });
}
