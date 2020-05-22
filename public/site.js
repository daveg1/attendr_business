// Total available pages.
const MAX = 4;

function setPage(n) {
    if (n < 1 || n > MAX) {
        console.log('Invalid page number.');
        return;
    }

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.getElementById('viewport').firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.
    focusAnnotations(n);
}

function focusAnnotations(n) {
    const noteLists = document.getElementsByClassName('annotations-list');
    let screen;

    for (let list of noteLists) {
        screen = +list.dataset.screen;

        if (screen === n) {
            list.setAttribute('rel', 'focused');
        } else if (screen !== n && list.getAttribute('rel')) {
            list.removeAttribute('rel');
        }
    }
}
