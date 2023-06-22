chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if(request.contentScriptQuery == "postActivitiesData") {
        fetch(request.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.activities)
        }).then(response => {
            if(response.status == 200) {
                return response.json();
            } else {
                return "ERROR"
            }
        }).then(json => {
            console.log(JSON.stringify(json))
        }).then(res => {
            sendResponse(res)
        })
    }

    return true
});