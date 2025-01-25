// chrome.contextMenus.create({
//   id: "speak",
//   title: "Speak",
//   contexts: ["selection"],
// });
// function checkExistingMenuItems() {
//   chrome.contextMenus.getAll(function (items) {
//     console.log(items);
//   });
// }

// chrome.contextMenus.onClicked.addListener(function (clickData) {
//   if (clickData.menuItemId == "speak" && clickData.selectionText) {
//     chrome.tts.speak(clickData.selectionText, { rate: 2 });
//   }
// });
