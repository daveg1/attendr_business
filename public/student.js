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

function switchConnections(id) {
    var e = document.getElementById(id);
    if (e.classList.contains("good")) {
        console.log("bad added");
        console.log(e);
        e.classList.add("bad");
        e.classList.remove("good");
    } else if (e.classList.contains("bad")) {
        console.log("good added");
        e.classList.add("good");
        e.classList.remove("bad");
    }
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

// No Signal - Student

function noSignal() {
    var bluetoothStatus = document.getElementById("bluetooth-disable");
    var style = window.getComputedStyle(bluetoothStatus);
    if (style.display == "block") {
        console.log("Signal Disabled");
        var bluetoothLogo = document.getElementById("bluetooth-send");
        bluetoothLogo.classList.add("bad");
        document.getElementsByClassName("active")[0].classList.add("bad");
        bluetoothLogo.classList.remove("pulse");
        document.getElementsByClassName('attendance-banner')[0].style.opacity = "1";
    } else {
        console.log(bluetoothStatus.style.display);
        console.log("Signal Enabled");
    }
}
