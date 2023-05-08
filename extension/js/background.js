$(document).ready(function() {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            
            console.log("bg:" + request)
            console.log("bg:" + sender)
            var url = 'http://localhost:8000/'

            fetch(url)
			.then(response => response.json())
			.then(response => sendResponse({farewell: response}))
			.catch(error => console.log(error))

        }
    )
})