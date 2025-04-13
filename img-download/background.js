function handle_menu_click() {
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    console.log(response);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadImage") {
    chrome.downloads.download(
      {
        url: message.imageUrl,
        filename: message.filename, // 设置文件名
        saveAs: false // 是否弹出保存对话框
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log(`Download started with ID: ${downloadId}`);
        }
      }
    );
  }
});