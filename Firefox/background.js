console.log("Background script chargé !");

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installée !");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendData") {
        console.log("Données reçues :", message.data);
        
        fetch("https://votre-serveur.com/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message.data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur :", data);
            sendResponse({ success: true, data });
        })
        .catch(error => {
            console.error("Erreur lors de l'envoi :", error);
            sendResponse({ success: false, error });
        });

        return true; // Permet de garder sendResponse actif pour les requêtes asynchrones
    }
});