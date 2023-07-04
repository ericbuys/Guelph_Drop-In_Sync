const API_KEY = 'AIzaSyCwKCkgq-1GAJqxjVRRuvV9d5Gwj_JaXLk';

/* This function checks to see if a calendar has already been created and retrieves its ID
 * If the calendar has not been created yet, it creates a new calendar
 */
async function getCalendarID(calendarName, activities, createCalendarEvents) {
    chrome.identity.getAuthToken({ interactive: true }, async function (token) {
        let calendarListURL = "https://www.googleapis.com/calendar/v3/users/me/calendarList"
        let calendarList_fetch_options = {
            method: "GET",
            async: true,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            contentType: "json",
        };
        let foundExisitingCalendarID = false;

        await fetch(calendarListURL, calendarList_fetch_options)
        .then(res => res.json())
        .then(data => {
            for(let i = 0; i < data['items'].length; i++) {
                console.log(data['items'][i]['summary'])

                if(data['items'][i]['summary'] == calendarName) {
                    foundExisitingCalendarID = true;
                    let calID = data['items'][i]['id']
                    createCalendarEvents(calID, activities, token)
                }
            }
        })

        //CalendarID doesn't exist, make new calendar
        if(foundExisitingCalendarID == false) {
            let calendarsURL = 'https://www.googleapis.com/calendar/v3/calendars'
            let calendarObject = {
                summary: calendarName
            }
            let newCalendar_fetch_options = {
                method: "POST",
                async: true,
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(calendarObject)
            }

            await fetch(calendarsURL, newCalendar_fetch_options)
            .then(res => res.json())
            .then(data => {
                calID = data['id']
                createCalendarEvents(calID, activities, token)
            })
        }
    });
}

//This function adds events to your google calendar
async function createCalendarEvents(calID, activities, token) {
    let insertEventURL = "https://www.googleapis.com/calendar/v3/calendars/" + calID + "/events"

    for(let i = 0; i < activities.length; i++) {
        let eventBody = {
            "summary": activities[i]['name'],
            "location": activities[i]['location'],
            "start": {
                'dateTime': activities[i]['startTime'],
                'timeZone': activities[i]['timeZone'],
            },
            "end": {
                'dateTime': activities[i]['endTime'],
                'timeZone': activities[i]['timeZone'],
            },
        }

        let newEvent_fetch_options = {
            method: "POST",
            async: true,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventBody)
        }

        await fetch(insertEventURL, newEvent_fetch_options)
        .then(res => res.json())
        .then(res => console.log(res))
    }
}

function offscreenScrapeEvents(request) { 
    return new Promise(async (resolve, reject) => {
        await chrome.offscreen.createDocument({
            url: '../html/osd.html',
            justification: 'ignored',
            reasons: ['DOM_SCRAPING']
        })

        let hd = await chrome.offscreen.hasDocument();

        if (hd) {
            console.log('sending message to osd')
            await chrome.runtime.sendMessage({
                target: 'offscreen',
                calendarName: request.calendarName,
                activities: request.activities
            })
            .then((response) => console.log(response))
    
            await chrome.offscreen.closeDocument();                         
        }

        console.log('outside if')

        resolve('offscreenScrapeEvents SUCCESS')
    })   
    
    // 
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.target !== 'background') {
        return
    }

    console.log('In Message Listener')

    if(request.message == "addToCalendar") {
        console.log('Recieved Message to create calendar')

        offscreenScrapeEvents(request).then((result) => {
            // Send the response with the result to the popup script
            sendResponse({ result: result });
        });
        return true;
    
    }
    
    sendResponse('TEST')
    return true;
});
