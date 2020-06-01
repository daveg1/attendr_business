// These would be global variables in site.js.
var dot = document.getElementsByClassName('phone-signal-dot')[0],
    btIcon = document.querySelector('.phone-signal i');

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
}