// Function to load a script dynamically
function loadScript(src) {
    var script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    document.head.appendChild(script);
  }

  // Detect browser and load corresponding JS file
  var userAgent = navigator.userAgent;

  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1) {
    // It's Chrome (not Firefox, as Firefox doesn't have "Chrome" in the user agent string)
    loadScript('chromePopup.js');
  } else if (userAgent.indexOf("Firefox") > -1) {
    // It's Firefox
    loadScript('firefoxPopup.js');
  }