import { ChromeImpl } from "./chromeImpl.js";
import { FirefoxImpl } from "./firefoxImpl.js";

let browserImpl;
const loadingIcon = document.getElementById("loadingIcon");
const saveButton = document.getElementById("saveButton");
const errorText = document.getElementById("errorText");
const successText = document.getElementById("successText");

if (navigator.userAgent.includes("Chrome")) {
  browserImpl = ChromeImpl;
} else if (navigator.userAgent.includes("Firefox")) {
  browserImpl = FirefoxImpl;
} else {
  throw new Error("Unsupported browser");
}

function isYoutube() {
  return browserImpl.getCurrentUrl().then((url) => {
    return url.includes("https://www.youtube.com/watch");
  });
}

function sendMessage(message) {
  loadingIcon.classList.add("hidden");
  saveButton.disabled = false;

  if (message.action === "saveSuccess") {
    successText.classList.remove("hidden");
    errorText.classList.add("hidden");
  } else if (message.action === "saveError") {
    successText.classList.add("hidden");
    errorText.classList.remove("hidden");
    errorText.textContent = `Error: ${
      message.message ||
      "An error occurred while saving the page. Please try again."
    }`;
  }
}

async function getShadowContent(pageDocument) {
  const allElements = pageDocument.elements;
  const shadowContent = [];
  allElements.forEach((element) => {
    if (element.shadowRoot) {
      shadowContent.push(element.shadowRoot.innerHTML);
    }
  });
  return shadowContent.join("");
}

async function saveContent() {
  let body = {};

  if (!(await isYoutube())) {
    const pageDocument = await browserImpl.getDocument();
    const content = pageDocument.html;
    body = {
      content: content + (await getShadowContent(pageDocument)),
    };
  }

  const url = await browserImpl.getCurrentUrl();

  try {
    browserImpl.addToStorage({ url: url });
    browserImpl.addToStorage({ body: body });
    browserImpl.openUrl(chrome.runtime.getURL("temporary_page.html"));
    sendMessage({ action: "saveSuccess" });
  } catch (error) {
    console.error(error);
    sendMessage({ action: "saveError", message: error.message });
  }
}

document.getElementById("saveButton").addEventListener("click", async () => {
  loadingIcon.classList.remove("hidden");
  saveButton.disabled = true;

  if (await browserImpl.checkForbiddenUrl()) {
    sendMessage({
      action: "saveError",
      message: "Cannot save pages from internal URLs.",
    });
  } else {
    await saveContent();
  }
});
