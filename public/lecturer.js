const tips = document.getElementsByClassName('tooltip-indicator');

function closeTooltip(){
    closeTooltip._s.classList.remove('active');
    closeTooltip._s = null;
    window.removeEventListener('click', closeTooltip, true);
}

function revealTooltip(){
    this.classList.add('active');

    closeTooltip._s = this;
    window.addEventListener('click', closeTooltip, true);
}

for(let t of tips){
    t.onclick = revealTooltip;
}