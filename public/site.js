"use strict";

// ---------------------------- //
//      Important Functions     //
// ---------------------------- //

// Holds a nodelist of attendees on marking screen.
// I.e. <div class="attendee"></div>
var markingItems;

// Recursively discovers in which app the function is being called.
function getApp(el){

    // Prevent infinite loop.
    if(!el || el.tagName === "BODY"){
        return false;
    } else if(el.className === 'phone-viewport'){
        return el.dataset.app;
    }

    return getApp(el.parentElement);
}

// Swap between pages a specified app (student or lecturer).
function setPage(el, n){
    const app = getApp(el);

    if(!app) return;

    if(n < 1){
        console.log('Invalid page number.');
        return;
    }

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.querySelector(`.phone-viewport[data-app="${app}"]`).firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.
}

// ---------------------------- //
//    Page-specific Functions   //
// ---------------------------- //

// Student profile tabs
function selectTab(button, tab){
    document.querySelector('.tabs-option[rel]').removeAttribute('rel');
    // The button clicked.
    button.setAttribute('rel', 'selected');

    document.querySelector('.tabs-screen[rel]').removeAttribute('rel');
    document.querySelector(`.tabs-screen[data-tab="${tab}"]`).setAttribute('rel', 'visible');
}

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
    // Assign global variable.
    markingItems = document.querySelectorAll('.marking .attendee');

    let studentItems = document.querySelectorAll('.signal .attendee');

    // Index, counter.
    let i, c = 0;
    for(i of studentItems){
        i._count = c; // Custom property to hold index of each item.
        i.onchange = markStudent;
        c++;
    }
});