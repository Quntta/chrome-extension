var currentPageUrl = '';
document.getElementById('urlForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  chrome.tabs.create({ url: `download.html?searchUrl=${currentPageUrl}` });
});

document.getElementById('reader').addEventListener('click', async function (event) {
  event.preventDefault();
  chrome.tabs.create({ url: `file-read.html` });
})

document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  urlInput.value = 'fdsafsa';
  // 获取当前页面的 URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ['content.js']
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentUrl' }, (response) => {
          if (response && response.url) {
            urlInput.value = response.url;
            currentPageUrl = response.url;
          } else {
            console.error('Failed to get URL:', chrome.runtime.lastError);
            urlInput.value = 'Error: ' + chrome.runtime.lastError.message;
          }
        });
      }
    );
  });
});