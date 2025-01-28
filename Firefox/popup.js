console.log("popup.js chargé !");

function showNotification(title, message) {
  if (browser.notifications) {
      browser.notifications.create({
          "type": "basic",
          "iconUrl": browser.runtime.getURL("icon.png"),
          "title": title,
          "message": message
      });
  }
}

document.getElementById("send").addEventListener("click", async () => {
    // Obtenez l'onglet actif
    console.log("Bouton cliqué !");

    // Récupérer l'onglet actif
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length || !tabs[0].url || tabs[0].url === "about:newtab") {
      console.error(" L'extension ne peut pas etre executee sur un nouvel onglet vide.");
      showNotification("⚠️ Erreur", "L'extension ne peut pas être exécutée sur un nouvel onglet vide. Veuillez charger une page web et réessayer.");
      return;
    } 

    const tab = tabs[0];
    console.log("Onglet actif :", tab);
  
    // Injectez un script pour récupérer l'HTML de la page
    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        url: window.location.href,
        html: document.documentElement.outerHTML
      })
    });

    console.log("Résultat de l'injection de script :", result);
  
    // Envoyez les données au serveur
    const { url, html } = result[0].result;
    await fetch("http://localhost:8080/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, html })
    });

    console.log("Les données ont été envoyées avec succès !");
    console.log("url: ", url);
    console.log("html: ", html);
  
    alert("Les données ont été envoyées avec succès !");
  });