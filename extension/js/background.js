import { addToCalendar } from "./calendar.js";

const updateCalendarAlarmName = 'updateCalendar'

//This function creates a offscreen document so that the background script can do webscraping
function offscreenScrapeEvents(activitiesList) { 
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
                activitiesList: activitiesList
            })
            .then((response) => {
                chrome.offscreen.closeDocument();                     
                resolve(response)
            })
        }

        reject('offscreenScrapeEvents FAILURE')
    })   
}

//Install Listener
chrome.runtime.onInstalled.addListener(details => {
    if(details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // chrome.runtime.setUninstallURL('https://example.com/extension-survey');
        console.log('Thankyou for installing!')

        chrome.alarms.create(
            updateCalendarAlarmName,
            {
                periodInMinutes: 60,
                when: Date.now()
            }
        )
    } 
})

//Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('In BG Message Handler')

    if(request.target !== 'background') {
        return
    }

    if(request.message == "addToCalendar") {
        console.log('Request recieved to scrape events from onMessage listener')

        offscreenScrapeEvents(request.activities)
        .then((result) => {
            console.log('Result in background message listener', result)
            addToCalendar(request.calendarName, result)
            sendResponse('result')
        });

        return true;
    } else if(request.message == 'testForAlarm') {
        //MOVE THIS TO ALARMS
        chrome.storage.sync.get(['calendars'])
        .then(result => {
            let calendarList = result.calendars
            let activityList = []

            new Promise((resolve, reject) => {
                calendarList.forEach((calendar, index, calendarList) => {
                    chrome.storage.sync.get([calendar])
                    .then(result => {
                        activityList.push(result[calendar])

                        if(index === calendarList.length - 1) {
                            resolve()
                        }
                    })
                })
            })
            .then(() => {
                offscreenScrapeEvents(activityList)
                .then((result) => {
                    console.log('Result in background message listener', result)
                    addToCalendar(calendarList, result)
                    sendResponse('result')
                });
            })
        })
        .catch(error => {
            sendResponse(error)
        })

        return true;
    }
});

//Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == updateCalendarAlarmName) {
        console.log('alarm went off')

        chrome.storage.sync.get(['calendars'])
        .then(result => {
            let calendarList = result.calendars
            let activityList = []

            if(calendarList == undefined) {
                return
            }

            new Promise((resolve, reject) => {
                calendarList.forEach((calendar, index, calendarList) => {
                    chrome.storage.sync.get([calendar])
                    .then(result => {
                        activityList.push(result[calendar])

                        if(index === calendarList.length - 1) {
                            resolve()
                        }
                    })
                })
            })
            .then(() => {
                offscreenScrapeEvents(activityList)
                .then((result) => {
                    console.log('Result in alarm message listener', result)
                    addToCalendar(calendarList, result)
                });
            })
        })
        .catch(error => {
            console.log(error)
        })
    }
})