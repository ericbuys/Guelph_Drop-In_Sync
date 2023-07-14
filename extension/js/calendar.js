// Adds the events to their respective calendar
async function addToCalendar(calendarList, activityList) {
    try {
        let authToken = await chrome.identity.getAuthToken({ interactive: true })
        let index = 0;
        for await(const calendar of calendarList) {
            let calID = await getCalendarID(authToken.token, calendar, true)
            await addEventsToCalendar(authToken.token, calID, activityList[index])
            index++
        }
    }
    catch {
        console.log('Error: User access not given')
    }
}

// Removes a calendar for the users google calendar
async function removeCalendar(calendarName) {
    return new Promise(async (resolve, reject) => {
        try {
            let authToken = await chrome.identity.getAuthToken({ interactive: true })
            let calID = await getCalendarID(authToken.token, calendarName, false)
    
            if(calID == null) {
                return
            }
        
            let fetchURL = "https://www.googleapis.com/calendar/v3/users/me/calendarList/" + calID
            let fetchOptions = {
                method: "DELETE",
                async: true,
                headers: {
                    Authorization: "Bearer " + authToken.token,
                    "Content-Type": "application/json",
                },
            };
            let response = await fetch(fetchURL, fetchOptions)
            
            if(response.ok == true) {
                resolve('Removed Calendar')
            } else {
                reject('Could not remove calendar')
            }

        } catch (e) {
            console.log(e)
        }
    })
}

/* This function checks to see if a calendar has already been created and retrieves its ID
 * If the calendar has not been created yet, it creates a new calendar
 */
async function getCalendarID(token, calendarName, createNewCalendar) {
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
        if(!createNewCalendar) {
            return null
        }

        let calendarsURL = 'https://www.googleapis.com/calendar/v3/calendars'
        let calendarObject = {
            summary: calendarName,
            timeZone: 'America/Toronto'
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
    dt.setDate(dt.getDate())

    const currentDay = dt.getDay()
    const startDate = new Date()
    const endDate = new Date()

    startDate.setDate(dt.getDate() - currentDay)
    endDate.setDate(dt.getDate() - currentDay + 6  + (numWeeksForward * 7))

    startDate.setSeconds(0)
    startDate.setMinutes(0)
    startDate.setHours(0)

    endDate.setSeconds(59)
    endDate.setMinutes(59)
    endDate.setHours(23)

    let dateObj = {
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString()
    }
    
    return dateObj
}

//Checks if two events are equal
function compareEvents(eventAdded, eventToAdd) {
    let startDate1 = new Date(eventAdded.start.dateTime)
    let endDate1 = new Date(eventAdded.end.dateTime)
    let startDate2 = new Date(eventToAdd['startTime'])
    let endDate2 = new Date(eventToAdd['endTime'])

    if(eventAdded.summary == eventToAdd['name'] && eventAdded.location == eventToAdd['location'] 
    && startDate1.getTime() == startDate2.getTime() && endDate1.getTime() == endDate2.getTime()) {
        return true;
    }

    return false
}

//This function adds events to your google calendar
async function addEventsToCalendar(token, calID, eventsToAdd) {
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
    
    //Retrieving added event sorted in order of startTime
    let eventsAdded = await fetch(eventsURL, eventList_fetch_options)
    .then(res => res.json())
    .then(res => res.items)
    
    //Checking which events to add
    for(let i = 0; i < eventsToAdd.length; i++) {
        let eventNotAdded = true

        for(let j = 0; j < eventsAdded.length; j++) {
            if(compareEvents(eventsAdded[j], eventsToAdd[i])) {
                eventNotAdded = false
                break
            }
        }

        //Adding event if it is not added
        if(eventNotAdded) {
            let eventBody = {
                "summary": eventsToAdd[i]['name'],
                "location": eventsToAdd[i]['location'],
                "start": {
                    'dateTime': eventsToAdd[i]['startTime'],
                    'timeZone': eventsToAdd[i]['timeZone'],
                },
                "end": {
                    'dateTime': eventsToAdd[i]['endTime'],
                    'timeZone': eventsToAdd[i]['timeZone'],
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

            await fetch(eventsURL, newEvent_fetch_options)
            .then(res => res.json())
        }
    }
}

export { addToCalendar, removeCalendar }