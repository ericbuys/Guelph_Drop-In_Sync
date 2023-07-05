// const API_KEY = 'AIzaSyCwKCkgq-1GAJqxjVRRuvV9d5Gwj_JaXLk';

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
                let calID = data['id']
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

export { getCalendarID, createCalendarEvents }