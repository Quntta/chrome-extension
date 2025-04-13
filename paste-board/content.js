console.log('paste-board/content.js');
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('收到消息：', request)
  if (request.greeting) {
    try {
      copyHandle('test 111');
      sendResponse('数据已经复制到剪切板！');
    } catch (error) {
      console.log('处理剪切板异常！');
      sendResponse('处理剪切板异常！');
    }
  } else {
    console.log('其他消息');
    sendResponse('收到其他消息');
  }
  return true; // 保持sendResponse可以异步调用
});

function copyHandle(text) {
  if (!navigator.clipboard) {
    alert('error');
  } else {
    navigator.clipboard.writeText(text).then(function() {
      console.log('复制成功');
    }, function(err) {
      console.error('复制失败', err);
    });
  }
}
