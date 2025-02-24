import { BrowserInterface } from "./interface.js";

export const ChromeImpl = {
  ...BrowserInterface,

  addToStorage: (value) => {
    console.log("Adding to storage:", value);
    chrome.storage.local.set(value);
  },

  getFromStorage: (key, callback) => {
    console.log("Getting from storage:", key);
    chrome.storage.local.get(key, callback);
  },

  checkForbiddenUrl: async () => {
    console.log("Checking forbidden URL");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab.url.includes("chrome://");
  },

  getCurrentUrl: async () => {
    console.log("Getting current URL");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab.url;
  },
  openUrl: (url) => {
    console.log("Opening new tab:", url);
    chrome.tabs.create({ url: url });
  },
  getDocument: async () => {
    console.log("Getting document");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        return {
          html: document.documentElement.outerHTML,
          elements: Array.from(document.querySelectorAll("*")).map(
            (el) => el.outerHTML
          ),
        };
      },
    });
    return result[0].result;
  },
};
