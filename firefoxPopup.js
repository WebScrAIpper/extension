const loadingIcon = document.getElementById('loadingIcon');
const saveButton = document.getElementById('saveButton');
const errorText = document.getElementById('errorText');
const successText = document.getElementById('successText');

async function executeContentScript() {
  const metadata = {
    authors: document.querySelector('meta[name="author"]')?.content || '',
    date: document.querySelector('meta[name="date"]')?.content || '',
    title: document.title,
    url: window.location.href,
    description: document.querySelector('meta[name="description"]')?.content || '',
  };

  const content = document.body.outerHTML;

  console.log("la",metadata, content);
  fetch('http://localhost:8080/api/articles', {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metadata, content }),
  })
    .then(() => browser.runtime.sendMessage({ action: 'saveSuccess' }))
    .catch(error => browser.runtime.sendMessage({ action: 'saveError', message: error.message }));
}

document.getElementById('saveButton').addEventListener('click', async () => {
  loadingIcon.classList.remove('hidden');
  saveButton.disabled = true;

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab.url.startsWith('about:')) {
    errorText.classList.remove('hidden');
    errorText.textContent = 'Cannot save pages from internal Firefox URLs.';
  } else {
    browser.scripting.executeScript({ target: { tabId: tab.id }, func: executeContentScript });
  }

  loadingIcon.classList.add('hidden');
  saveButton.disabled = false;
});

browser.runtime.onMessage.addListener((message) => {
  loadingIcon.classList.add('hidden');
  saveButton.disabled = false;

  if (message.action === 'saveSuccess') {
    successText.classList.remove('hidden');
    errorText.classList.add('hidden');
  } else if (message.action === 'saveError') {
    errorText.classList.remove('hidden');
    errorText.textContent = `Error: ${message.message || 'An error occurred while saving the page. Please try again.'}`;
  }
});
