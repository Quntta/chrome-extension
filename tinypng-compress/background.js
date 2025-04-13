function handle_menu_click() {
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    console.log(response);
  });
}