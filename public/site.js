"use strict";

// ---------------------------- //
//            Globals           //
// ---------------------------- //

var
// Holds the confirm prompt on lecturers' app.
    confirmBox,

// Holds the current page.
    currentPage = {
        student: 0,
        lecturer: 0
    },

// Holds  the signal dot, and bluetooth, icon between the phones.
    dot,
    btIcon,

//  States whether the student app has marked themselves in.
    markingComplete = false,

//  Holds a nodelist of attendees on marking screen.
    markingItems,

//  Flag that tells whether the marking page on the lecturer app is open or not.
    markingOpen = false,

    markingStep = 1,

//  Holds a nodelist of <div>s which represent the steps on the student's signal page.
    messages,

//  Holds the animation function interval for searching a signal.
    fetchSignal = null,

//  Sign ins loaded.
    signInsDone = false,

//  Flags that enable and disable bluetooth and wifi on the student's phone.
    signals = {
        bluetooth: false,
        wifi: false
    }
;

// ---------------------------- //
//      Important Functions     //
// ---------------------------- //

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
    // If el is an ElementNode (a.k.a. object), use getApp.
    // Else, leave as is and assume string was given.
    const app = typeof(el) === "object" ? getApp(el) : el;

    if(!app || n < 1) return;

    currentPage[app] = n;

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.querySelector(`.phone-viewport[data-app="${app}"]`).firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.

    tooltipPage(app, n);
}

// Returns the current page.
function getPage(app){
    return currentPage[app];
}

function showBanner(type){
    // Stop pulse animation and add red text.
    const statusLogo = document.querySelector('.attendance-status i'),
              banner = document.getElementsByClassName('attendance-banner')[0],
            messages = document.getElementsByClassName('attendance-messages')[0];

    statusLogo.classList.remove('pulse');

    switch(type){
        case 'bluetooth':
            statusLogo.classList.add('bad');
            banner.classList.add('bad');
            banner.querySelector('.bluetooth').setAttribute('rel', 'visible');
            messages.classList.add('bad');
            break;
        case 'wifi':
            statusLogo.classList.add('warn');
            banner.classList.add('warn');
            banner.querySelector('.wifi').setAttribute('rel', 'visible');
            break;
        case 'done':
            statusLogo.classList.add('done');
            banner.classList.add('done');
            banner.querySelector('.done').setAttribute('rel', 'visible');
            break;
    }

    document.getElementsByClassName('attendance-banner')[0].setAttribute('rel', 'show');
}

function closeBanner(){
    document.querySelector('.attendance-status i').className = "fab fa-bluetooth-b";
    document.getElementsByClassName('attendance-messages')[0].className = "attendance-messages";

    const banner = document.getElementsByClassName('attendance-banner')[0];

    banner.className = "attendance-banner";
    banner.querySelector('[rel]').removeAttribute('rel');
}

function resume(n){
    closeBanner();

    n = n | markingStep;

    switch(n){
        case 1:
            listenForSignal();
            break;
        case 2:
            collectData();
            break;
        case 3:
            sendAttendance();
            break;
    }
}

// Resumes animations where applicable.
function restoreConnection(type){
    document.querySelector('.attendance-status i').className = "fab fa-bluetooth-b";

    document.getElementsByClassName('attendance-messages')[0].className = "attendance-messages";
    document.getElementsByClassName('attendance-banner')[0].removeAttribute('rel');
}

// Enables/disabled Bluetooth and Wi-Fi.
function toggleConnection(type){
    if(signals[type]){
        signals[type] = false;
    } else {
        signals[type] = true;
    }

    // When a signal is turned on.
    if(signals[type]){
        if(type === 'bluetooth' && markingStep < 3){   // Ignore the third step.
            resume();
        } else if(type === 'wifi' && markingStep > 1){ // Ignore the first step.
            resume();
        }
    }
}


// ---------------------------- //
//           Student            //
// ---------------------------- //

// Student profile tabs
function selectTab(button, tab){
    document.querySelector('.tabs-option[rel]').removeAttribute('rel');
    // The button clicked.
    button.setAttribute('rel', 'selected');

    document.querySelector('.tabs-screen[rel]').removeAttribute('rel');
    document.querySelector(`.tabs-screen[data-tab="${tab}"]`).setAttribute('rel', 'visible');
}

// Step 3 of marking.
function sendAttendance(){
    markingStep = 3;

    setTimeout(() => {
        if(!signals['bluetooth']){
            return showBanner('bluetooth');
        }

        sendSignal();

        setTimeout(() => {
            messages[2].classList.replace('active', 'done');
            messages[2].firstElementChild.checked = true;

            signAttendance();
        }, 1800);
    }, 1000);
}

// Step 2 of marking.
function collectData(){
    markingStep = 2;

    // Complete the "Listening for signal" step and make the next one active.
    messages[0].classList.replace('active', 'done');
    messages[0].firstElementChild.checked = true;
    messages[1].classList.add('active');

    // Stop pulse animation on bluetooth logo.
    document.querySelector('.attendance-status i').classList.remove('pulse');

    returnSignal();

    // Random delay between 2s and 4s.
    let r = (Math.random() * 4000) + 2000;

    setTimeout(() => {
        if(!signals['bluetooth']){
            return showBanner('bluetooth');
        } else if(!signals['wifi']){
            return showBanner('wifi');
        }

        sendAttendance();

        messages[1].classList.replace('active', 'done');
        messages[1].firstElementChild.checked = true;
        messages[2].classList.add('active');
    }, r);
}

// Step 1 of marking.
function listenForSignal(){
    markingStep = 1;

    if(markingComplete){
        return;
    }

    messages[0].classList.add('active');

    sendSignal();
    fetchSignal = setInterval(function(){
        // Global flag.
        if(!signals['bluetooth']){
            clearInterval(fetchSignal);
            showBanner('bluetooth');
        } else if(markingOpen){
            clearInterval(fetchSignal);
            collectData();
        } else {
            sendSignal();
        }
    }, 2000);
}

function stopListening(){
    setPage('student', 2);
    clearInterval(fetchSignal);
}

// Fill in user details
function fillUser(){
    const username = document.getElementsByName('username')[0].value;
    document.getElementById("username").innerHTML = username;
    // Generate random ID
    document.getElementById("student-number").innerHTML = Math.floor(100000 + Math.random() * 900000);
}

// ---------------------------- //
//           Lecturer           //
// ---------------------------- //

function closeBox(){
    confirmBox.removeAttribute('rel');
    confirmBox.getElementsByTagName('button')[0].removeAttribute('data-n');
}

function openConfirm(n){
    confirmBox.setAttribute('rel', 'visible');
    confirmBox.getElementsByTagName('button')[0].dataset.n = n;
}

// General-use function to mark a student.
function markStudent(e){
    if(typeof(e) === "string"){
        document.querySelectorAll('.signal .attendee')[+e].click();
        closeBox();
    } else if(e.screenY){
        openConfirm(this._count);
        e.preventDefault();
    } else {
        markingItems[this._count].click();
    }
}

// Todo: combine send- and receiveSignal into one function.
function sendSignal(){
    let pos = 0, opac = 0;
    let move = setInterval(moveDot, 5);

    function moveDot(){
        if(pos <= 140){
            opac += .01;
        } else if(pos >= 140){
            opac -= .01;
        }

        if(pos === 100){
            btIcon.style.color = "#4794eb";
        } else if(pos === 180){
            btIcon.removeAttribute('style');
        }

        if(pos === 276) clearInterval(move);

        pos++;

        dot.style.left = pos+"px";
        dot.style.opacity = opac;
    }
}

function returnSignal(){
    let pos = 276, opac = 0;
    let move = setInterval(moveDot, 5);

    function moveDot(){
        if(pos >= 140){
            opac += .01;
        } else if(pos <= 140){
            opac -= .01;
        }
        if(pos === 0) clearInterval(move);

        pos--;

        dot.style.left = pos+"px";
        dot.style.opacity = opac;
    }
}

function loadAttendees(){
    setPage('lecturer', 3);

    for(let i = 0; i < markingItems.length; ++i){
        markingItems[i].style.opacity = "0";

        setTimeout(() => {
            markingItems[i].removeAttribute('style');
        }, 250*(i+1));
    }
}

function simulateSignIns(){
    setPage('lecturer', 4);

    if(signInsDone){
        return;
    }
    signInsDone = true;

    const attendee = document.querySelectorAll('.signal .attendee input');

    let delay = 0;
    for(let i = 0; i < attendee.length-2; ++i){
        delay = (Math.random() * i * 500) + 500;

        setTimeout(() => {
            attendee[i].click();
        }, delay);
    }
}

function openMarking(){
    simulateSignIns();
    markingOpen = true;
}

function signAttendance(){
    let attendee = document.querySelectorAll('.signal .attendee input');

    attendee[attendee.length-2].click();

    markingComplete = true;
    showBanner('done');
}


// ---------------------------- //
//           Generic            //
// ---------------------------- //

// Validates user signing.
function validateSignin(e){
    e.preventDefault();

    const form = new FormData(this);
    const output = this.nextElementSibling;

    output.removeAttribute('rel');

    for(let v of form.entries()){
        if(!v[1]){
            output.innerText = `The ${v[0]} cannot be blank.`;
            output.setAttribute('rel', 'visible');
            return;
        }
    }

    closeTooltip();
    fillUser();
    setPage(this, 2);
}

function dragStyle(){
    this.classList.toggle('dragging');
}

// dndLogo.ondrop
function changeImage(elem, file){
    const img = URL.createObjectURL(file);

    // Remove image from memory (spares some memory).
    elem.onload = function(){
        URL.revokeObjectURL(img);
    }

    elem.classList.remove('dragging');
    elem.style.backgroundImage = `url(${img})`;
    elem.innerText = '';
}

function fileDrop(e){
    e.preventDefault();

    changeImage(this, e.dataTransfer.files[0]);
}

function fileClick(){
    const input = this.nextElementSibling;

    input.onchange = (e) => {
        changeImage(this, e.target.files[0]);
    }

    input.click();
}


// ---------------------------- //
//           Tooltips           //
// ---------------------------- //

// Shows and hides tooltips based on the page.
function tooltipPage(app, n){
    let pages = document.querySelector(`.tooltip-app[data-app="${app}"]`).children;

    for(let p of pages){
        if(+p.dataset.page === n){
            p.setAttribute('rel', 'visible');
        } else {
            p.removeAttribute('rel');
        }
    }
}

function closeTooltip(){
    if(!closeTooltip._s){
        return;
    }

    closeTooltip._s.classList.remove('active');
    closeTooltip._s = null;

    document.getElementsByClassName('walkthrough-overlay')[0].removeAttribute('rel');
    document.getElementsByClassName('walkthrough-active')[0].classList.remove('walkthrough-active');

    window.removeEventListener('click', closeTooltip, true);
}

function checkTooltip(e){
    if(e.target && e.target.classList.contains('walkthrough-overlay')){
        closeTooltip();
    }
}

function openTooltip(){
    this.classList.add('active');
    document.getElementsByClassName('walkthrough-overlay')[0].setAttribute('rel', 'visible');

    document.querySelector(`[data-tooltip="${this.dataset.for}"]`).classList.add('walkthrough-active');

    closeTooltip._s = this;
    window.addEventListener('click', checkTooltip, true);
}


// ---------------------------- //
//            Loader            //
// ---------------------------- //

// Runs when page is rendered and sets necessary global variables.
window.addEventListener('DOMContentLoaded', (e) => {
    // Assign global variables.
    markingItems = document.querySelectorAll('.marking .attendee');
        messages = document.getElementsByClassName('message');
      confirmBox = document.getElementsByClassName('marking-confirm')[0];
             dot = document.getElementsByClassName('phone-signal-dot')[0],
          btIcon = document.querySelector('.phone-signal i');

    const studentItems = document.querySelectorAll('.signal .attendee input');

    // Index, counter.
    let i, c = 0;
    for(i of studentItems){
        i._count = c; // Custom property to hold index of each item.
        i.onclick = markStudent;
        c++;
    }

    // Add input validation on forms.
    for(let form of document.getElementsByClassName('phone-form')){
        form.onsubmit = validateSignin;
    }

    const dndLogo = document.getElementById('dnd-logo');

    dndLogo.addEventListener('dragenter', dragStyle, false);
    dndLogo.addEventListener('dragleave', dragStyle, false);
    dndLogo.addEventListener('drop', fileDrop, false);
    dndLogo.addEventListener('click', fileClick, false);

    // Stops the file from going to a new page.
    dndLogo.addEventListener('dragover', (e) => e.preventDefault(), false);

    // Initialise the tooltips.
    const tips = document.getElementsByClassName('tooltip-indicator');
    for(let t of tips){
        t.onclick = openTooltip;
    }
});
