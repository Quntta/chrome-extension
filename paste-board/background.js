//新增一个右键菜单（只创建一次）
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      type: 'normal',
      title: "测试菜单",
      id: 'menu_test',
      contexts: ['all']
  })
})

//右键菜单点击事件处理
chrome.contextMenus.onClicked.addListener(
  (info, tab) => {
     if(info.menuItemId=='menu_test'){
          //捕获到点击事件后的具体处理
          handle_menu_click();
      }
  }
)

function handle_menu_click() {
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    console.log(response);
  });
}