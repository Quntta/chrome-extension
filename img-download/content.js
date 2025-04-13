chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentUrl') {
    sendResponse({ url: window.location.href });
  }
});