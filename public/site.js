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

    //  Holds a nodelist of <div>s which represent the steps on the student's signal page.
    messages,

    //  Holds the animation function interval for searching a signal.
    fetchSignal = null,

    //  Sign ins loaded.
    signInsDone = false,

    //  Flags that enable and disable bluetooth and wifi on the student's phone.
    signals = {
        bluetoothSignal: false,
        wifiSignal: false
    };

// ---------------------------- //
//      Important Functions     //
// ---------------------------- //

// Recursively discovers in which app the function is being called.
function getApp(el) {

    // Prevent infinite loop.
    if (!el || el.tagName === "BODY") {
        return false;
    } else if (el.className === 'phone-viewport') {
        return el.dataset.app;
    }

    return getApp(el.parentElement);
}

// Swap between pages a specified app (student or lecturer).
function setPage(el, n) {
    // If el is an ElementNode (a.k.a. object), use getApp.
    // Else, leave as is and assume string was given.
    const app = typeof (el) === "object" ? getApp(el) : el;

    if (!app || n < 1) return;

    currentPage[app] = n;

    // Do note, that the first screen is receiving the margin style, not the viewport itself.
    // Else, it falls out of view completely.
    document.querySelector(`.phone-viewport[data-app="${app}"]`).firstElementChild.style.marginLeft = `calc(-292px * ${n-1})`; // Subtract one to avoid an extra page shift.

    tooltipPage(app, n);
}

// Returns the current page.
function getPage(app) {
    return currentPage[app];
}

// Enables/disabled Bluetooth and Wi-Fi.
function toggleConnection(type) {
    if (signals[type]) {
        signals[type] = false;
    } else {
        signals[type] = true;
    }

    if (type === 'bluetooth' && signals[type]) {
        restoreConnection();
    } else {
        showConnectionError();
    }

    if (type === 'wifi' && signals[type]) {
        if (type === 'bluetooth' && signals[type]){
            console.log("Data Turned On");
            document.querySelector('.attendance-status i').classList.add('pulse');
            messages[0].classList.add("good");
            messages[1].classList.add("good");
            messages[0].firstElementChild.checked = true;
            messages[1].firstElementChild.checked = true;
            messages[2].firstElementChild.checked = false;
            messages[2].classList.add('active');
            messages[2].style.color = "#333";
            collectData();
        }
    }
}

// ---------------------------- //
//           Student            //
// ---------------------------- //

// Student profile tabs
function selectTab(button, tab) {
    document.querySelector('.tabs-option[rel]').removeAttribute('rel');
    // The button clicked.
    button.setAttribute('rel', 'selected');

    document.querySelector('.tabs-screen[rel]').removeAttribute('rel');
    document.querySelector(`.tabs-screen[data-tab="${tab}"]`).setAttribute('rel', 'visible');
}

function showConnectionError() {
    document.getElementById("bluetooth-btn").style.borderColor = "#ccc";
    // Stop pulse animation and add red text.
    document.querySelector('.attendance-status i').classList.remove('pulse');
    document.querySelector('.attendance-status i').classList.add('bad');

    // Revert the steps.
    messages[0].className = 'message split';
    messages[1].className = 'message split';
    messages[2].className = 'message split';

    //
    document.getElementsByClassName('attendance-messages')[0].classList.add('bad');
    document.getElementsByClassName('attendance-banner')[0].setAttribute('rel', 'show');
}

function restoreConnection() {
    console.log("connection restored");
    document.getElementById("bluetooth-btn").style.borderColor = "#1074e6";
    document.querySelector('.attendance-status i').classList.remove('bad');
    document.querySelector('.attendance-status i').classList.add('pulse');

    document.getElementsByClassName('attendance-messages')[0].classList.remove('bad');
    document.getElementsByClassName('attendance-banner')[0].removeAttribute('rel');

    if (getPage('student') === 3) {
        listenForSignal();
    }
}

function noDataConnection(){
    console.log("No data triggered");
    document.querySelector('.attendance-status i').classList.remove('pulse');
    messages[2].classList.replace('active', 'bad');
    messages[2].firstElementChild.checked = true;
    document.getElementsByClassName('attendance-banner')[1].style.background = '#f0c756';
    document.getElementsByClassName('attendance-banner')[1].setAttribute('rel', 'show');
    document.querySelector('.attendance-status i').style.color = '#f0c756';
}

function returnDataConnection(){
    console.log("Data active");
    messages[2].classList.replace('active', 'good');
    messages[2].firstElementChild.checked = true;
    document.getElementsByClassName('attendance-messages')[0].classList.add('good');
    messages[0].classList.replace('active', 'good');
    document.getElementsByClassName('attendance-banner')[2].style.background = '#39ac60';
    document.getElementsByClassName('attendance-banner')[2].setAttribute('rel', 'show');
    document.querySelector('.attendance-status i').style.color = '#39ac60';
    document.querySelector('.attendance-status i').classList.remove('pulse');
}

function sendAttendance() {
    setTimeout(() => {
        if (!signals['bluetooth']) {
            showConnectionError();
            return;
        }

        sendSignal();

        setTimeout(() => {
            messages[2].classList.replace('active', 'good');
            messages[2].firstElementChild.checked = true;
            signAttendance();
        }, 1800);
    }, 1000);
}

function collectData() {
    // Complete the "Listening for signal" step and make the next one active.
    document.getElementsByClassName('attendance-messages')[0].classList.remove('bad');
    document.getElementsByClassName('attendance-banner')[0].removeAttribute('rel');
    document.getElementsByClassName('attendance-banner')[1].removeAttribute('rel');
    document.querySelector('.attendance-status i').style.color = '#333';
    messages[0].classList.replace('active', 'good');
    messages[0].firstElementChild.checked = true;
    messages[1].classList.add('active');

    returnSignal();

    // Random delay between 2s and 4s.
    let r = (Math.random() * 4000) + 2000;

    setTimeout(() => {
        if (!signals['bluetooth']) {
            showConnectionError();
        } else {
            sendAttendance();
            messages[1].classList.replace('active', 'good');
            messages[1].firstElementChild.checked = true;
            messages[2].classList.add('active');
        }

        if (!signals['wifi']) {
            noDataConnection();
        } else {
            returnDataConnection();
            messages[2].style.color = "#39ac60";
            signAttendance();
        }}, r);
}

function listenForSignal() {
    setPage('student', 3);

    if (markingComplete) {
        return;
    }

    messages[0].classList.add('active');

    sendSignal();
    fetchSignal = setInterval(function () {
        // Global flag.
        if (!signals['bluetooth']) {
            clearInterval(fetchSignal);
            showConnectionError();
        } else if (markingOpen) {
            clearInterval(fetchSignal);
            collectData();
        } else {
            sendSignal();
        }
    }, 2000);
}

function stopListening() {
    setPage('student', 2);
    clearInterval(fetchSignal);
}


// ---------------------------- //
//           Lecturer           //
// ---------------------------- //

function closeBox() {
    confirmBox.removeAttribute('rel');
    confirmBox.getElementsByTagName('button')[0].removeAttribute('data-n');
}

function openConfirm(n) {
    confirmBox.setAttribute('rel', 'visible');
    confirmBox.getElementsByTagName('button')[0].dataset.n = n;
}

// General-use function to mark a student.
function markStudent(e) {
    if (typeof (e) === "string") {
        document.querySelectorAll('.signal .attendee')[+e].click();
        closeBox();
    } else if (e.screenY) {
        openConfirm(this._count);
        e.preventDefault();
    } else {
        markingItems[this._count].click();
    }
}

// Todo: combine send- and receiveSignal into one function.
function sendSignal() {
    let pos = 0,
        opac = 0;
    let move = setInterval(moveDot, 5);

    function moveDot() {
        if (pos <= 140) {
            opac += .01;
        } else if (pos >= 140) {
            opac -= .01;
        }

        if (pos === 100) {
            btIcon.style.color = "#4794eb";
        } else if (pos === 180) {
            btIcon.removeAttribute('style');
        }

        if (pos === 276) clearInterval(move);

        pos++;

        dot.style.left = pos + "px";
        dot.style.opacity = opac;
    }
}

function returnSignal() {
    let pos = 276,
        opac = 0;
    let move = setInterval(moveDot, 5);

    function moveDot() {
        if (pos >= 140) {
            opac += .01;
        } else if (pos <= 140) {
            opac -= .01;
        }
        if (pos === 0) clearInterval(move);

        pos--;

        dot.style.left = pos + "px";
        dot.style.opacity = opac;
    }
}

function loadAttendees() {
    setPage('lecturer', 3);

    for (let i = 0; i < markingItems.length; ++i) {
        markingItems[i].style.opacity = "0";

        setTimeout(() => {
            markingItems[i].removeAttribute('style');
        }, 250 * (i + 1));
    }
}

function simulateSignIns() {
    setPage('lecturer', 4);

    if (signInsDone) {
        return;
    }
    signInsDone = true;

    const attendee = document.querySelectorAll('.signal .attendee input');

    let delay = 0;
    for (let i = 0; i < attendee.length - 2; ++i) {
        delay = (Math.random() * i * 500) + 500;

        setTimeout(() => {
            attendee[i].click();
        }, delay);
    }
}

function openMarking() {
    simulateSignIns();
    markingOpen = true;
}

function signAttendance() {
    let attendee = document.querySelectorAll('.signal .attendee input');

    attendee[attendee.length - 2].click();

    markingComplete = true;
}

// ---------------------------- //
//           Generic            //
// ---------------------------- //

// Validates user signing.
function validateSignin(e) {
    e.preventDefault();

    const form = new FormData(this);
    const output = this.nextElementSibling;

    output.removeAttribute('rel');

    for (let v of form.entries()) {
        if (!v[1]) {
            output.innerText = `The ${v[0]} cannot be blank.`;
            output.setAttribute('rel', 'visible');
            return;
        }
    }

    setPage(this, 2);
}

// Sync Timers
let lecturetime = 0;
let studenttime = 0;

function lectureTimer() {
    var time = new Date();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    setInterval(function() {
    console.log("Timer started");
    if (lecturetime > 120){
        document.getElementsByClassName("time")[1].innerHTML = "Few minutes ago";
    }
    if (lecturetime > 240){
        document.getElementsByClassName("time")[1].innerHTML = + hour + ":" + minutes;
    }
    lecturetime++;
    }, 1000);
}

function studentTimer() {
    var time = new Date();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    setInterval(function() {
    console.log("Timer started");
    if (studenttime > 120){
        document.getElementsByClassName("time")[0].innerHTML = "Few minutes ago";
    }
    if (studenttime > 240){
        document.getElementsByClassName("time")[0].innerHTML = + hour + ":" + minutes;
    }
    studenttime++;
    }, 1000);
}

// Animate spinner
function addSpinner() {
    var spin = document.getElementById(event.target.id);
    spin.classList.add("fa-spin");
    // If Lecturer Sync icon
    if (event.target.id == "lecturer-spinner") {
        var sync = document.getElementsByClassName("sync-message")[1];
        var timeDisplay = document.getElementsByClassName("time")[1];
        timeDisplay.style.fontWeight = "600";
        timeDisplay.style.color = "#000";
        // Add new card
        var lectureCard = document.getElementsByClassName("lecture-item");
        var lastCard = document.getElementsByClassName("lecture-list")[0].lastElementChild;
        var cardNumber = Math.floor(Math.random() * 3);
        var cloneCard = lectureCard[cardNumber].cloneNode(true);
        lastCard.after(cloneCard);
        // Start/Stop Lecturer Timer
        if (lecturetime > 0) {
            console.log("Timer stopped");
            clearInterval(lectureTimer);
            lecturetime = 0;
            } else {
                lectureTimer();
            }
    // Student Sync Icon
    } else {
        var sync = document.getElementsByClassName("sync-message")[0];
        var timeDisplay = document.getElementsByClassName("time")[0];
        timeDisplay.style.fontWeight = "600";
        timeDisplay.style.color = "#000";
        // Add new card
        var lectureCard = document.getElementsByClassName("lecture-item");
        var lastCard = document.getElementsByClassName("tabs-screen")[1].lastElementChild;
        var cardNumber = Math.floor(Math.random() * 2);
        var cloneCard = lectureCard[cardNumber].cloneNode(true);
        lastCard.after(cloneCard);
        // Start/Stop Student Timer
        if (studenttime > 0) {
            console.log("Timer stopped");
            clearInterval(studentTimer);
            studenttime = 0;
            } else {
                studentTimer();
            }
    }

    // Remove Sync Animation
    setTimeout(function () {
        spin.classList.remove("fa-spin");
        timeDisplay.style.fontWeight = "normal";
        timeDisplay.style.color = "#888";
    }, 1000);
}


// ---------------------------- //
//           Tooltips           //
// ---------------------------- //

// Shows and hides tooltips based on the page.
function tooltipPage(app, n) {
    let pages = document.querySelector(`.tooltip-app[data-app="${app}"]`).children;

    for (let p of pages) {
        if (+p.dataset.page === n) {
            p.setAttribute('rel', 'visible');
        } else {
            p.removeAttribute('rel');
        }
    }
}

function closeTooltip() {
    closeTooltip._s.classList.remove('active');
    closeTooltip._s = null;
    window.removeEventListener('click', closeTooltip, true);
}

function revealTooltip() {
    this.classList.add('active');

    closeTooltip._s = this;
    window.addEventListener('click', closeTooltip, true);
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
    for (i of studentItems) {
        i._count = c; // Custom property to hold index of each item.
        i.onclick = markStudent;
        c++;
    }

    // Add input validation on forms.
    for (let form of document.getElementsByClassName('phone-form')) {
        form.onsubmit = validateSignin;
    }

    // Initialise the tooltips.
    const tips = document.getElementsByClassName('tooltip-indicator');
    for (let t of tips) {
        t.onclick = revealTooltip;
    }
});
