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

function compareStartDates(obj1, obj2) {
    let timeOne = new Date(obj1.start.dateTime)
    let timeTwo = new Date(obj2.start.dateTime)

    return timeOne - timeTwo
}

//This function adds events to your google calendar
async function addEventsToCalendar(token, calID, activities) {
    let eventsURL = "https://www.googleapis.com/calendar/v3/calendars/" + calID + "/events"

    let eventList_fetch_options = {
        method: "GET",
        async: true,
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        }
        // orderBy: 'startTime',
        // singleEvents: true
    }

    let events = await fetch(eventsURL, eventList_fetch_options)
    .then(res => res.json())
    .then(res => {
        let eventList = res.items

        //API orderBy atrb????

        console.log(eventList)
        console.log('pre')
        eventList.forEach(elm => console.log(elm.start.dateTime))
        eventList.sort(compareStartDates)
        console.log('post')
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