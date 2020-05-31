function toggleConnection(type){
    let icon = document.getElementsByClassName(`${type}-connection`)[0];

    if(icon.getAttribute('rel')){
        icon.removeAttribute('rel');
    } else {
        icon.setAttribute('rel', 'disabled');
    }
}

function sendAttendance(){
    setTimeout(() => {
        sendSignal();

        setTimeout(() => {
            messages[2].classList.replace('active', 'good');
            messages[2].firstElementChild.checked = true;

            signAttendance();
        }, 1800);
    }, 1000);
}

function collectData(){
    // Complete the "Listening for signal" step and make the next one active.
    messages[0].classList.replace('active', 'good');
    messages[0].firstElementChild.checked = true;
    messages[1].classList.add('active');

    // Stop pulse animation on bluetooth logo.
    document.querySelector('.attendance-status i').classList.remove('pulse');

    returnSignal();

    // Random delay between 2s and 4s.
    let r = (Math.random() * 4000) + 2000;

    setTimeout(() => {
        sendAttendance();

        messages[1].classList.replace('active', 'good');
        messages[1].firstElementChild.checked = true;
        messages[2].classList.add('active');
    }, r);
}

function listenForSignal(){
    setPage('student', 3);

    sendSignal();
    fetchSignal = setInterval(function(){
        // Global flag.
        if(markingOpen){
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