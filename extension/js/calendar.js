// const API_KEY = 'AIzaSyCwKCkgq-1GAJqxjVRRuvV9d5Gwj_JaXLk';

async function addToCalendar(calendarList, activityList) {
    console.log('In calendar.js')

    let authToken = await chrome.identity.getAuthToken({ interactive: true })
    let index = 0;

    for await(const calendar of calendarList) {
        console.log(index)
        let calID = await getCalendarID(authToken.token, calendar)
        await addEventsToCalendar(authToken.token, calID, activityList[index])
        index++
    }
}

/* This function checks to see if a calendar has already been created and retrieves its ID
 * If the calendar has not been created yet, it creates a new calendar
 */
async function getCalendarID(token, calendarName) {
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

    return await fetch(calendarListURL, calendarList_fetch_options)
    .then(res => res.json())
    .then(async (data) => {
        //Checking if an exisiting calID exists
        for(let i = 0; i < data['items'].length; i++) {
            if(data['items'][i]['summary'] == calendarName) {
                return data['items'][i]['id']
            }
        }

        //No Exisisting calID found
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

        return await fetch(calendarsURL, newCalendar_fetch_options)
        .then(res => res.json())
        .then(data => data['id'])
    })
}

//Create start and end date for fetching events from calendar
function getFetchDate(numWeeksForward) {
    const dt = new Date()
    dt.setDate(dt.getDate() + (numWeeksForward * 7))

    const currentDay = dt.getDay()
    const startDate = new Date()
    const endDate = new Date()

    startDate.setDate(dt.getDate() - currentDay)
    endDate.setDate(dt.getDate() - currentDay + 6)

    startDate.setSeconds(0)
    startDate.setMinutes(0)
    startDate.setHours(0)

    endDate.setSeconds(59)
    endDate.setMinutes(59)
    endDate.setHours(23)

    let dateObj = {
        startISO: startDate.toISOString(),
        // endISO: '2023-07-03T03:59:59.842Z'
        endISO: endDate.toISOString()
    }
    
    return dateObj
}

//This function adds events to your google calendar
async function addEventsToCalendar(token, calID, activities) {
    let fetchDate = getFetchDate(0)
    let eventsURL = "https://www.googleapis.com/calendar/v3/calendars/" + calID + "/events"
    eventsURL += '?orderBy=startTime&singleEvents=true'
    eventsURL += '&timeMin=' + fetchDate.startISO
    eventsURL += '&timeMax=' + fetchDate.endISO

    let eventList_fetch_options = {
        method: "GET",
        async: true,
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        }
    }
    
    console.log(getFetchDate(0))
    let events = await fetch(eventsURL, eventList_fetch_options)
    .then(res => res.json())
    .then(res => {
        let eventList = res.items

        //API orderBy atrb????

        console.log(eventList)
        console.log('pre')
        eventList.forEach(elm => console.log(elm.start.dateTime))

        return eventList
    })

    //COMPARE 

    // for(let i = 0; i < activities.length; i++) {
    //     let eventBody = {
    //         "summary": activities[i]['name'],
    //         "location": activities[i]['location'],
    //         "start": {
    //             'dateTime': activities[i]['startTime'],
    //             'timeZone': activities[i]['timeZone'],
    //         },
    //         "end": {
    //             'dateTime': activities[i]['endTime'],
    //             'timeZone': activities[i]['timeZone'],
    //         },
    //     }

    //     let newEvent_fetch_options = {
    //         method: "POST",
    //         async: true,
    //         headers: {
    //             Authorization: "Bearer " + token,
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(eventBody)
    //     }

    //     await fetch(eventsURL, newEvent_fetch_options)
    //     .then(res => res.json())
    //     .then(res => console.log(res))
    // }
}

export { addToCalendar }