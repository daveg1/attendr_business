var links, sections, viewer, images;

const screens = {
    'login': 0,
    'attendance': 305,
    'tips': 610
}

// Phone demo functions.
function screen(scr) {
    document.getElementById('screens').style.marginLeft = `-${screens[scr]}px`;
}

function mark(el) {
    let i = el.getElementsByClassName('marker')[0];

    if (i.classList.contains('fa-check')) {
        return;
    }

    i.className = 'marker fa fa-paper-plane';

    setTimeout(() => {
        i.className = 'marker fa fa-check';
    }, 2500);
}

// Image viewer functions.
function closeViewer() {
    this.innerHTML = '';
}

function createViewer() {
    let v = document.createElement('div');

    v.id = 'viewer';
    v.title = 'Click anywhere to close.';

    document.body.insertBefore(
        v,
        document.body.firstElementChild
    );

    v.onclick = closeViewer;

    return v;
}

function view() {
    const src = this.getAttribute('src'),
        img = document.createElement('img');

    img.src = src;

    viewer.innerHTML = '';
    viewer.appendChild(img);
}

// Navbar functions
function setActive(el) {
    if (document.getElementsByClassName('active')[0]) {
        document.getElementsByClassName('active')[0].removeAttribute('class');
    }
    el.className = 'active';
}

window.addEventListener('DOMContentLoaded', function () {
    links = document.getElementById('links').children;
    sections = document.getElementsByClassName('nav-section');

    viewer = createViewer();
    images = document.querySelectorAll('.screenshot-list img');

    if (!images) return;

    for (let img of images) {
        img.onclick = view;
    }

    for (let link of links) {
        window.onscroll = function (e) {
            for (let s of sections) {
                if (s.classList.contains('active')) {
                    continue;
                } else if (s.getBoundingClientRect().top - 81 < 0 && (s.nextElementSibling.getBoundingClientRect().top - 81 > 0 || null)) {
                    let el = document.querySelector(`.links a[href="#${s.id}"]`);
                    setActive(el);
                }
            }
        }
    }
}, false);

function goBack() {
    screen('attendance');
}

function validateLogin() {
    var warning_message = document.getElementById("warning-message");
    if (document.getElementById("password").value.length >= 5 && document.getElementById("username").value.length >= 1) {
        warning_message.innerHTML = "";
        screen('attendance');
        warning_message.classList.remove("padded");
    } else {
        warning_message.innerHTML = "Sorry, your password must be more than 5 characters and your username can't be blank.";
        warning_message.classList.add("padded");
    }
}
