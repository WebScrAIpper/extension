import { ChromeImpl } from "./chromeImpl.js";
import { FirefoxImpl } from "./firefoxImpl.js";

let browserImpl;

if (navigator.userAgent.includes("Chrome")) {
  browserImpl = ChromeImpl;
} else if (navigator.userAgent.includes("Firefox")) {
  browserImpl = FirefoxImpl;
} else {
  throw new Error("Unsupported browser");
}

browserImpl.getFromStorage("apiUrl", (data) => {
  const apiUrl = data.apiUrl || "http://localhost:8080";
  document.getElementById("urlInput").value = apiUrl;
  document.getElementById("urlInput").classList.remove("hidden");
  document.getElementById("urlChangeSave").classList.remove("hidden");
});

document.getElementById("urlChangeSave").addEventListener("click", () => {
  const inputField = document.getElementById("urlInput");
  const newUrl = inputField.value.trim();

  if (newUrl) {
    let apiUrl = newUrl.startsWith("http") ? newUrl : "http://" + newUrl;
    document.getElementById("output").innerText = "Updated URL: " + apiUrl;
    browserImpl.addToStorage({ apiUrl });
  } else {
    document.getElementById("output").innerText = "Please enter a valid URL";
    document.getElementById("output").color = "red";
  }
});
