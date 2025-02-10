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

document.getElementById("urlChangeSave").addEventListener("click", () => {
  const inputField = document.getElementById("urlInput");
  const newUrl = inputField.value.trim();

  if (newUrl) {
    let apiUrl = newUrl.startsWith("http") ? newUrl : "http://" + newUrl;
    document.getElementById("output").innerText = "Updated URL: " + apiUrl;
    browserImpl.addToStorage({ apiUrl });
  } else {
    sendMessage({ action: "saveError", message: "Please enter a valid URL." });
  }
});

document.getElementById("urlChangeButton").addEventListener("click", () => {
  browserImpl.getFromStorage("apiUrl", (data) => {
    const apiUrl = data.apiUrl || "http://localhost:8080";
    document.getElementById("urlInput").value = apiUrl;
    document.getElementById("urlInput").classList.remove("hidden");
    document.getElementById("urlChangeSave").classList.remove("hidden");
    document.getElementById("output").innerText = "Current URL: " + apiUrl;
  });
});

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

async function saveContent(apiUrl) {
  let endpoint = "build";
  let body = {};

  if(await isYoutube()) {
    endpoint = "youtubeBuild";
  }
  else{
    const pageDocument = await browserImpl.getDocument();
    const content = pageDocument.html;
    body = content + await getShadowContent(pageDocument);
  }
  
  const url = await browserImpl.getCurrentUrl();
  fetch(`${apiUrl}/api/${endpoint}?url=${encodeURIComponent(url)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((errorMessage) => {
          throw new Error("Failed to save the page: " + errorMessage);
        });
      }
      sendMessage({ action: "saveSuccess" });
    })
    .catch((error) => {
      console.log(error);
      sendMessage({ action: "saveError", message: error.message });
    });
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
    await browserImpl.getFromStorage("apiUrl", async (data) => {
      const storedApiUrl = data.apiUrl || "http://localhost:8080";
      await saveContent(storedApiUrl);
    });
  }
});