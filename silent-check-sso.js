window.onload = function () {
    if (window.parent !== window) {
        window.parent.postMessage(location.href, location.origin);
    }
};
