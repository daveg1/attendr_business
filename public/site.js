// Margin values for CSS.
const screens = {
    'login': 0,
    'attendance': 305,
    'tips': 610
}

// Swipe the phone screen.
function screen(scr){
    document.getElementById('screens').style.marginLeft = `-${screens[scr]}px`;
}

// Mark attendance (student's app).
function mark(el){
    let i = el.getElementsByClassName('marker')[0];

    if(i.classList.contains('fa-check')) return;
    i.className = 'marker fa fa-paper-plane';

    setTimeout(() => {
        i.className = 'marker fa fa-check';
    }, 2500);
}

function validateLogin(){
    const warning_message = document.getElementById("warning-message");

    if(document.getElementById("password").value.length >= 5 && document.getElementById("username").value.length >= 1){
        warning_message.removeAttribute('rel');
        screen('attendance');
    } else {
        warning_message.innerHTML = "Sorry, your password must be more than 5 characters and your username can't be blank.";
        warning_message.setAttribute('rel', 'visible');
    }
}
