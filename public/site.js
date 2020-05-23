"use strict";

// ---------------------------- //
//      Important Functions     //
// ---------------------------- //

// Holds a nodelist of attendees on marking screen.
// I.e. <div class="attendee"></div>
var markingItems;

// Dynamically grab the maximum pages.
function getMax(){
    if(document.getElementById('viewport')){
        return +document.getElementById('viewport').dataset.maxPages;
    }
    return window.requestAnimationFrame(getMax); // Better than while true loops.
}

// Total available pages.
const MAX = getMax();

// Swap between pages of annotations.
function focusAnnotations(n){
    const noteLists = document.getElementsByClassName('annotations-list');
    let screen;

    for(let list of noteLists){
        screen = +list.dataset.screen;

        if(screen === n){
            list.setAttribute('rel', 'focused');
        } else if(screen !== n && list.getAttribute('rel')){
            list.removeAttribute('rel');
        }
    }
}

// Swap between pages on the app.
function setPage(n){
    if(n < 1 || n > MAX){
        console.log('Invalid page number.');
        return;
    }

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.getElementById('viewport').firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.
    focusAnnotations(n);
}

// ---------------------------- //
//    Page-specific Functions   //
// ---------------------------- //

// Signal page attendee items.
function markStudent(e){
    e.preventDefault();

    // Grabs custom property, and simulates a click on the equivalent
    // item on the previous page, concomitantly marking both.
    markingItems[this._count].click();
}

// ---------------------------- //
//           Generic            //
// ---------------------------- //

// Runs when page is rendered and sets necessary global variables.
window.addEventListener('DOMContentLoaded', (e) => {
    // Signal page items.
    markingItems     = document.querySelectorAll('.marking .attendee');
    let studentItems = document.querySelectorAll('.signal .attendee');

    // Index, counter.
    let i, c = 0;
    for(i of studentItems){
        i._count = c; // Custom property to hold index of each item.
        i.onchange = markStudent;
        c++;
    }
});