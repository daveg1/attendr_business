function simulateConnection(){
    const dot = document.getElementsByClassName('phone-signal-dot')[0];

    dot.style.cssText = "left: 276px; opacity: 1";

    setTimeout(() => {
        document.querySelector('.phone-signal i').style.color = "#1074e6";
    }, 500);

    setTimeout(() => {
        dot.removeAttribute('style');
    }, 2500);

    setTimeout(() => {
        document.querySelector('.phone-signal i').style.color = "#1074e6";
    }, 3250);

    setTimeout(() => {
        document.querySelector('.phone-signal i').removeAttribute('style');
    }, 3750);


}

function loadAttendees(){
    setPage('lecturer', 3);

    const attendee = document.querySelectorAll('.marking .attendee');

    for(let i = 0; i < attendee.length; ++i){
        attendee[i].style.opacity = "0";

        setTimeout(() => {
            attendee[i].removeAttribute('style');
        }, 250*(i+1));
    }
}

function simulateSignIns(){
    const attendee = document.querySelectorAll('.signal .attendee input');

    let delay = 0;
    for(let i = 0; i < attendee.length-2; ++i){
        delay = (Math.random() * i * 500) + 500;

        setTimeout(() => {
            attendee[i].checked = true;
        }, delay);
    }

    setPage('lecturer', 4);
}