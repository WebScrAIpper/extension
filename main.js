import { ChromeImpl } from "./chromeImpl.js";
import { FirefoxImpl } from "./firefoxImpl.js";
import Keycloak from "./node_modules/keycloak-js/lib/keycloak.js";

const keycloak = new Keycloak({
  url: "http://localhost:8000/",
  realm: "WebScrAIpper",
  clientId: 'WebScrAIpper-rest-api'
});

async function checkLogin() {
  console.log("🚀 Checking Keycloak login status...");
  
  try {
    // "onLoad: check-sso", Tries to check authentication without redirecting
    // "silentCheckSsoRedirectUri", Uses an iframe with "silent-check-sso.html" to verify login in the background
    const authenticated = await keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: chrome.runtime.getURL("silent-check-sso.html")
    });
    console.log("Keycloak login check completed");
    
    if (authenticated) {
      console.log("✅ User is authenticated:", keycloak.token);
    } else {
      console.log("❌ User is not authenticated");
    }

    return authenticated;
  } catch (error) {
    console.error("❗ Error during Keycloak login check:", error);
  }
}

checkLogin().then(authenticated => {
  if (authenticated) {
    console.log("User is authenticated with Keycloak");
  } else {
    console.log("User is not authenticated with Keycloak");
  }
});

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
  const token = keycloak.token;
  fetch(`${apiUrl}/api/${endpoint}?url=${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
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