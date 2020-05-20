// Total available pages.
const MAX = 3;

function setPage(n){
    if(n < 1 || n > MAX){
        console.log('Invalid page number.');
        return;
    }

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.getElementById('viewport').firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.
}