export function animateHandle(){
    const handle = document.getElementById("handle");
    handle.style.transform="translateY(20px)";
    setTimeout(()=>{ handle.style.transform="translateY(0)"; },200);
}
