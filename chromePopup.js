document.getElementById('saveButton').addEventListener('click', async () => {
  const loadingIcon = document.getElementById('loadingIcon');
  const saveButton = document.getElementById('saveButton');
  const errorText = document.getElementById('errorText');

  loadingIcon.classList.remove('hidden');
  saveButton.disabled = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if(tab.url.includes('chrome://')){
    errorText.classList.remove('hidden');
    errorText.textContent = 'Cannot save pages from internal Chrome URLs.';
    loadingIcon.classList.add('hidden');
    saveButton.disabled = false;
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: executeContentScript,
  });

  function executeContentScript() {
    chrome.runtime.sendMessage({ action: 'startLoading' });

    const metadata = {
      authors : document.querySelector('meta[name="author"]')?.content || '',
      date: document.querySelector('meta[name="date"]')?.content || '',
      title: document.title,
      url: window.location.href,
      description: document.querySelector('meta[name="description"]')?.content || '',
    };

    const content = document.body.outerHTML;
  
    fetch('http://localhost:8080/api/articles', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata, content }),
    })
    .then(response => {
      alert('Page saved successfully!'); //
    })
    .catch(error => {
      console.error('Error saving the page:', error);
      chrome.runtime.sendMessage({ action: 'endLoading' });
      alert('Error saving the page.');
    });
  }
});
