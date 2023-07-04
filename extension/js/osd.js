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
    return await fetch(url, options)
    .then(res => res.json())
    .then((html) => {
        let page = new DOMParser().parseFromString(html['html'], "text/html")

        //Creating Search String for retrieving all matching events
        let searchString = "//div[contains(@class, 'eventName')";
        for(let i = 0; i < activities.length; i++) {
            if(i < 1) {
                searchString += ' and ('
            }

            searchString += 'contains(text(), "' + activities[i] + '")'

            if(i < activities.length - 1 && activities.length != 1) {
                searchString += ' or '
            }

        }
        searchString += ')]'

        //Finding additional event information
        let events = page.evaluate(searchString, page, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null)
        let node = null

        //Iterating through all events found
        while (node = events.iterateNext()) {
            const eventName = node.innerHTML.trim()
            const eventLocation = node.parentElement.querySelector('.eventLocation').innerHTML.trim()
            const eventStartTime = node.parentElement.querySelector('.startTime').innerHTML.trim()
            const eventEndTime = node.parentElement.querySelector('.endTime').innerHTML.trim()
            const eventDay = node.parentElement.closest('.block.day').classList[2]
            const eventTimes = getEventTimes(eventStartTime, eventEndTime, eventDay)

            const eventObj = {
                name: eventName,
                location: eventLocation,
                startTime: eventTimes['start'],
                endTime: eventTimes['end'],
                timeZone: 'America/Toronto'
            }
            eventList.push(eventObj)
        }

        //await getCalendarID(calName, eventList, createCalendarEvents)

        return eventList

    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.target !== 'offscreen') {
        return
    }

    scrapeEvents(request.activities, 0, request.calendarName).then((result) => {
        // Send the response with the result to the popup script
        sendResponse({ result: result });
    });
    return true;
})