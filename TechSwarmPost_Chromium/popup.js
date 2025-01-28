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
    console.log('metadata:', metadata);
    console.log('content:', content);
  
    fetch('https://your-api-endpoint.com/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata, content }),
    })
    .then(response => {
      if (response.ok) {
        chrome.runtime.sendMessage({ action: 'endLoading' });
        alert('Page saved successfully!');
      } else {
        chrome.runtime.sendMessage({ action: 'endLoading' });
        alert('Failed to save the page.');
      }
    })
    .catch(error => {
      console.error('Error saving the page:', error);
      chrome.runtime.sendMessage({ action: 'endLoading' });
      alert('Error saving the page.');
    });
  }
});
