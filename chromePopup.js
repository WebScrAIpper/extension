const loadingIcon = document.getElementById("loadingIcon");
const saveButton = document.getElementById("saveButton");
const errorText = document.getElementById("errorText");
const successText = document.getElementById("successText");

async function executeContentScript() {
  const content = document.body.outerHTML;

  fetch(`http://localhost:8080/api/build?url=${window.location.href}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: content,
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
      console.log("Success:", data);
      chrome.runtime.sendMessage({ action: "saveSuccess" });
    })
    .catch((error) => {
      console.log(error);
      chrome.runtime.sendMessage({
        action: "saveError",
        message: error.message,
      });
    });  
}

document.getElementById("saveButton").addEventListener("click", async () => {
  loadingIcon.classList.remove("hidden");
  saveButton.disabled = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("chrome://")) {
    errorText.classList.remove("hidden");
    errorText.textContent = "Cannot save pages from internal Chrome URLs.";
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: executeContentScript,
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
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
