chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // const htmlStripper = document.createElement("template")
    // const striphtml = html => {
    //     htmlStripper.innerHTML = html
    //     return htmlStripper.content.textContent
    // }
    // sendResponse({'reply': striphtml(msg.html)})
    console.log('IN OSD')
    sendResponse('True')
})