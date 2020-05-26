const signalDot = document.getElementsByClassName('phone-signal-dot')[0];

function simulateMark(){
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