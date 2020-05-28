// Lecturer Marking

const signalDot = document.getElementsByClassName('phone-signal-dot')[0];

function simulateMark() {
    // Signal swipes from left to right.
    signalDot.style.cssText = "left: 102px; opacity: 1";

    setTimeout(() => {
        signalDot.style.opacity = '0';
        signalDot.nextElementSibling.style.color = '#4794eb';
    }, 500);

    setTimeout(() => {
        signalDot.nextElementSibling.removeAttribute('style');
    }, 950);

    setTimeout(() => signalDot.style.cssText = "left: 174px", 1000);

    setTimeout(() => {
        signalDot.style.cssText = "left: 276px; opacity: 1";
    }, 1250);

    setTimeout(() => signalDot.removeAttribute('style'), 3000);

}

// Disable/Enable Connections (WiFi and Bluetooth)

function disableConnections(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}

// Animate spinner

function addSpinner() {
    var spin = document.getElementById("spinner");
    spin.classList.add("fa-spin");
    setTimeout(removeSpinner, 3000);
}

function removeSpinner() {
    var spin = document.getElementById("spinner");
    spin.classList.remove("fa-spin");
}
