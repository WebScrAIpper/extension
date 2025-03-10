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
