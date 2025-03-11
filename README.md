# Load and Test an Extension for Firefox, Chrome, and Edge  

This document explains how to load and test an extension on **Mozilla Firefox**, **Google Chrome**, and **Microsoft Edge**.  

## Loading the Extension  

### **Mozilla Firefox**  
1. **Open Firefox**.  
2. Go to the following URL: `about:debugging#/runtime/this-firefox`.  
3. Click on **"Load Temporary Add-on"**.  
4. Navigate to the folder containing the extension files.  
5. Select the `manifest.json` file.  

### **Google Chrome & Microsoft Edge**  
1. **Open Chrome**.  
2. Go to the following URL: `chrome://extensions/` or `edge://extensions/`.  
3. Enable **Developer mode**.  
4. Click on **"Load unpacked"**.  
5. Navigate to the folder containing the extension files.  
6. Select the folder containing `manifest.json`.  

---

## Viewing Extension Logs  

### **Mozilla Firefox**  
1. **Go to** `about:debugging#/runtime/this-firefox`.  
2. Find the extension and click **"Inspect"**.  

### **Google Chrome & Microsoft Edge**  
1. **Open** `chrome://extensions/` or `edge://extensions/`.  
2. Find the extension and click **"Details"**.  
3. Click **"Inspect views background"** to open the developer console.

---

## Publishing the extension

### Mozilla Firefox (Firefox Add-ons Store)
1. **Go to the Firefox Add-ons website**: [https://addons.mozilla.org/](https://addons.mozilla.org/).
2. **Sign in to your Mozilla account** (or create one if you don’t have it).
3. **Click on "Submit a New Add-on"**.
6. **Once submitted**, the extension will be reviewed by Mozilla, which may take a few days.
7. **Once approved**, the extension will be published and available for Firefox users.

### Google Chrome (Chrome Web Store)
1. **Go to the Chrome Web Store Developer Dashboard**: [https://chrome.google.com/webstore/developer/dashboard](https://chrome.google.com/webstore/developer/dashboard).
2. **Sign in with your Google account**.
3. **Click on "Add a new item"**.
6. **Once you've published it**, Google will review the extension, which may take a few days.
7. **Once approved**, the extension will be published and available for Chrome users.

---

