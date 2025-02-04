const loadingIcon = document.getElementById("loadingIcon");
const saveButton = document.getElementById("saveButton");
const errorText = document.getElementById("errorText");
const successText = document.getElementById("successText");

async function executeContentScript(apiUrl) {
  const content = document.body.outerHTML;
  
  fetch(`${apiUrl}/api/build?url=${window.location.href}`, {

  const allElements = document.querySelectorAll("*");
  const shadowContent = [];
  allElements.forEach((element) => {
    if (element.shadowRoot) {
      shadowContent.push(element.shadowRoot.innerHTML);
    }
  });
  const combinedContent = content + shadowContent.join("");

    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: combinedContent,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((errorMessage) => {
          throw new Error("Failed to save the page: " + errorMessage);
        });
      }
      return response.json();
    })
    .then((data) => {
      browser.runtime.sendMessage({ action: "saveSuccess" });
    })
    .catch((error) => {
      console.log(error);
      browser.runtime.sendMessage({
        action: "saveError",
        message: error.message,
      });
    });
}

document.getElementById("urlChangeButton").addEventListener("click", () => {
  browser.storage.local.get("apiUrl", (data) => {
    const apiUrl = data.apiUrl || "http://localhost:8080";
    document.getElementById("urlInput").value = apiUrl; // Ensure the correct element is targeted
    document.getElementById("urlInput").classList.remove("hidden"); // Remove 'hidden' from urlInput
    document.getElementById("urlChangeSave").classList.remove("hidden");
    document.getElementById("output").innerText = "Current URL: " + apiUrl;
  });
});

document.getElementById("urlChangeSave").addEventListener("click", () => {
  const inputField = document.getElementById("urlInput");
  const newUrl = inputField.value.trim();

  if (newUrl) {
    let apiUrl = newUrl.startsWith("http") ? newUrl : "http://" + newUrl;
    document.getElementById("output").innerText = "Updated URL: " + apiUrl;

    browser.storage.local.set({ apiUrl });
  } else {
    browser.runtime.sendMessage({
      action: "saveError",
      message: "Please enter a valid URL.",
    });
  }
});

document.getElementById("saveButton").addEventListener("click", async () => {
  loadingIcon.classList.remove("hidden");
  saveButton.disabled = true;

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab.url.startsWith("about:")) {
    errorText.classList.remove("hidden");
    errorText.textContent = "Cannot save pages from internal Firefox URLs.";
  } else {
    browser.storage.local.get("apiUrl", (data) => {
      const storedApiUrl = data.apiUrl || "http://localhost:8080"; // Default fallback

      console.log("Executing content script with API URL:", storedApiUrl);
      browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: executeContentScript,
        args: [storedApiUrl],
      });
    });
  }
});

browser.runtime.onMessage.addListener((message) => {
  loadingIcon.classList.add("hidden");
  saveButton.disabled = false;

  if (message.action === "saveSuccess") {
    successText.classList.remove("hidden");
    errorText.classList.add("hidden");
  } else if (message.action === "saveError") {
    errorText.classList.remove("hidden");
    errorText.textContent = `Error: ${
      message.message ||
      "An error occurred while saving the page. Please try again."
    }`;
  }
});
