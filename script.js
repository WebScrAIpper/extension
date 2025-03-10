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

function createElement(id, className, textContent = "") {
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement("div");
    element.id = id;
    element.className = className;
    element.textContent = textContent;
    document.body.appendChild(element);
  }

  return element;
}

function animateTitle() {
  const title = document.querySelector("h1");
  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    title.innerHTML = `Your document <a href="${url}">(link)</a> is being summarized${".".repeat(dots)}`;
  }, 500);
  return interval;
}

document.addEventListener("DOMContentLoaded", async function () {
  const errorText = createElement("errorText", "error", "An error occurred.");
  const successText = createElement(
    "successText",
    "success",
    "Page saved successfully!"
  );
  const loadingIcon = createElement("loadingIcon", "spinner");
  const urlDisplay = document.getElementById("urlDisplay");
  const title = document.querySelector("h1");

  const titleAnimation = animateTitle();

  const displayError = (message) => {
    clearInterval(titleAnimation);
    title.textContent = "An error occurred!";
    loadingIcon.style.display = "none";
    errorText.textContent = message;
    errorText.style.display = "block";
  };

  const handleSavePage = async () => {
    try {
      const data = await new Promise((resolve, reject) => {
        browserImpl.getFromStorage(["url", "body", "apiUrl"], (data) => {
          if(!data.apiUrl){
            data.apiUrl = "http://localhost:8080";
          }
          if (!data.url || !data.body) {
            reject("URL or body not found in storage.");
          } else {
            resolve(data);
          }
        });
      });

      const { url, body, apiUrl } = data;
      urlDisplay.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;

      const endpoint = "build";
      
      let encodedUrl = encodeURIComponent(window.location.href);
      const response = await fetch(`${apiUrl}/api/${endpoint}?url=${url}&redirect=${encodedUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        displayError("Failed to save the page.");
        const errorTextContent = await response.text();
        throw new Error("Failed to save the page: " + errorTextContent);
      }
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const responseData = await response.json();
      clearInterval(titleAnimation);
      title.textContent = "The summary is done.... About to reroute...";
      successText.textContent = "Page saved successfully!";
      loadingIcon.style.display = "none";
      successText.style.display = "block";

      const contentContainer = createElement("content", "content");
      contentContainer.innerHTML = `<pre>${JSON.stringify(
        responseData,
        null,
        2
      )}</pre>`;
    } catch (error) {
      displayError(error.message);
    }
  };

  await handleSavePage();
});
