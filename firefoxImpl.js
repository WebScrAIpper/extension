import { BrowserInterface } from "./interface.js";

export const FirefoxImpl = {
  ...BrowserInterface,

  addToStorage: (value) => {
    console.log("Adding to storage:", value);
    browser.storage.local.set(value);
  },

  getFromStorage: (key, callback) => {
    console.log("Getting from storage:", key);
    browser.storage.local.get(key, callback);
  },

  checkForbiddenUrl: async () => {
    console.log("Checking forbidden URL");
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab.url.startsWith("about:");
  },

  getCurrentUrl: async () => {
    console.log("Getting current URL");
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab.url;
  },
  openUrl: (url) => {
    console.log("Opening new tab:", url);
    browser.tabs.create({ url: url });
  },
  getDocument: async () => {
    console.log("Getting document");
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
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
