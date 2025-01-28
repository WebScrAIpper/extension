document.getElementById("send").addEventListener("click", async () => {
    // Obtenez l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // Injectez un script pour récupérer l'HTML de la page
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        url: window.location.href,
        html: document.documentElement.outerHTML
      })
    });
  
    // Envoyez les données au serveur
    const { url, html } = result[0].result;
    await fetch("https://votre-serveur.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, html })
    });
  
    alert("Les données ont été envoyées avec succès !");
  });