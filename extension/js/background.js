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

//Create start and end date for fetching fit and rec activities
function getFetchDate(numWeeksForward) {
    const dt = new Date()
    dt.setDate(dt.getDate() + (numWeeksForward * 7))

    const currentDay = dt.getDay()

    const startDate = new Date()
    const endDate = new Date()

    startDate.setDate(dt.getDate() - currentDay)
    endDate.setDate(dt.getDate() - currentDay + 6)

    let dateObj = {
        start: startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate(),
        end: endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate()
    }
    
    return dateObj
}

//Returns start and end time for an event
function getEventTimes(startTime, endTime, day) {
    const DAY_INDEX = {
        'day_1': 0,
        'day_2': 1,
        'day_3': 2,
        'day_4': 3,
        'day_5': 4,
        'day_6': 5,
        'day_7': 6
    }
    const dt = new Date()
    const startDate = new Date()
    const endDate = new Date()

    //Seperating Start/End Time important information
    startTime = startTime.split(" ")
    endTime = endTime.split(" ")

    startClockSide = startTime[1]
    endClockSide = endTime[1]

    startTime = startTime[0].split(":")
    endTime = endTime[0].split(":")
    
    //Setting Day of Event
    startDate.setDate(dt.getDate() + DAY_INDEX[day] - dt.getDay())
    endDate.setDate(dt.getDate() + DAY_INDEX[day] - dt.getDay())

    //Clearing Seconds for Event
    startDate.setSeconds(0)
    endDate.setSeconds(0)

    // //Setting Start Time
    startDate.setHours(parseInt(startTime[0]) + ((startClockSide == 'AM') ? 0 : 12))
    startDate.setMinutes(startTime[1])

    // //Setting End Time
    endDate.setHours(parseInt(endTime[0]) + ((endClockSide == 'AM') ? 0 : 12))
    endDate.setMinutes(endTime[1])

    return {
        start: startDate.toISOString(),
        end: endDate.toISOString()
    }
}

//Scrape events from FitndRec site
async function scrapeEvents(activities, numWeeksForward, calName) {
    console.log('about to fetch')
        
    const url = "https://fitandrec.gryphons.ca/REST/Event/getEventsWeekView"
    let fetchDate = getFetchDate(numWeeksForward)
    let options = {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "https://fitandrec.gryphons.ca/sports-clubs/drop-in-rec",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "resourceID=5&lang=EN&eventsFromDate=" + fetchDate['start'] + "&eventsToDate=" + fetchDate['end'] + "&categoryID=-1&instanceConfigID=1456&filtersJson=",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }
    let eventList = []
    
    //Requesting Events from FitandRec
    fetch(url, options)
    .then(res => res.json())
    .then(async function(html) {
        console.log(html['html'])
        page = new DomParser().parseFromString(html['html'], "text/html")[0]
        console.log(page)

        //Creating Search String for retrieving all matching events
        let searchString = "";
        for(let i = 0; i < activities.length; i++) {
            if(i > 0) {
                searchString += ', '
            }
            searchString += '.eventName:contains(' + activities[i] + ')'
        }

        //Finding additional event information
        events = $(page).find(searchString)
        $(events).each(function() {
            let eventName = $(this).text().trim()
            let eventStartTime = $(this).siblings('.info').find('.startTime').text()
            let eventEndTime = $(this).siblings('.info').find('.endTime').text()
            let eventLocation = $(this).siblings('.location').find('.eventLocation').text()
            let eventDay = $(this).parents('.block.day').attr("class").split(/\s+/)[2]

            const eventTimes = getEventTimes(eventStartTime, eventEndTime, eventDay)

            let eventObj = {
                name: eventName,
                location: eventLocation,
                startTime: eventTimes['start'],
                endTime: eventTimes['end'],
                timeZone: 'America/Toronto'
            }

            eventList.push(eventObj)
        })

        //await getCalendarID(calName, eventList, createCalendarEvents)

    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}

async function offscreenScrapeEvents() {
    const myHtml = "<div>Ciao<span>amico</span>come <b id='foo'>va?</b></div>";
    
    await chrome.offscreen.createDocument({
        url: '../html/osd.html',
        justification: 'ignored',
        reasons: ['DOM_SCRAPING']
    })
    let hd = await chrome.offscreen.hasDocument();
    console.log(hd)

    if (hd) {

        let reply = await chrome.runtime.sendMessage(
            {
                html: 'ohueigrhkjb',
                message: 'offscreen'
            }
        );
        // await chrome.offscreen.closeDocument();                         
        console.log(reply)
        console.log('after reply')
    }
    
    console.log('outside if')
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // scrapeEvents(request.activities, 0, request.calendarName)

    // Once the asynchronous operations are complete, return the result
    return "Async operation completed";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('In Message Listener')

        if(request.message == "addToCalendar") {
            console.log('Recieved Message to create calendar')

            offscreenScrapeEvents().then((result) => {
                // Send the response with the result to the popup script
                sendResponse({ result: result });
            });
            return true;
        
        }
    
    sendResponse('TEST')
    return true;
});
