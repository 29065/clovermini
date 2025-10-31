export function initCharmShop(){
    const charmShop = document.getElementById("charmShop");
    const charmList = [
        {id:"Lucky Clover", cost:2}, 
        {id:"7️⃣ Booster", cost:3},
        {id:"Diamond Charm", cost:5},
        {id:"Golden Star", cost:4},
        {id:"Cherry Bomb", cost:2},
        {id:"Magic Lamp", cost:6},
        {id:"Four Leaf Clover", cost:5},
        {id:"Lucky Cat", cost:3},
        {id:"Horseshoe", cost:3},
        {id:"Gold Coin", cost:4}
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
