function addActivity(activityName) {
    let activityStr =   '<div class="list-group-item added">\n' +
                        '   <div class="activity-name">' + activityName + '</div>\n' +
                        '   <button type="button" class="btn primary remove-btn remove-activity">Remove</button>\n' +
                        '</div>'
    return activityStr
}

//Checks if the Calendar Form has been filled out properly
function checkFormValidity(event) {
    let calName = $(event).find("#cal-name").val();
    let numActivitiesSelected = $(event).find('#selected-activities').children().length;
    let returnVal = true;

    //Checking for valid calendar name
    if(calName.length < 1 || calName.length > 254) {
        returnVal = false;
        $("#cal-name").tooltip('enable')
        $("#cal-name").addClass("invalid-input animate-invalid-input");

        setTimeout(function () { 
            $("#cal-name").removeClass('animate-invalid-input');
        }, 1000);

    } else {
        $("#cal-name").tooltip('disable')
        if($("#cal-name").hasClass('invalid-input')) {
            $("#cal-name").toggleClass('invalid-input')
        }
    }

    //Checking for valid number of activities selected
    if(numActivitiesSelected < 1) {
        returnVal = false;
        $("#activities").tooltip('enable')
        $("#activities").addClass("invalid-input animate-invalid-input");

        setTimeout(function () { 
            $("#activities").removeClass('animate-invalid-input');
        }, 1000);
    } else {
        $("#activities").tooltip('disable')
        if($("#activities").hasClass('invalid-input')) {
            $("#activities").toggleClass('invalid-input')
        }
    }

    return returnVal;
}

function saveCalendarToStorage(event) {
    console.log('start of saveCalendarToStorage')

    let calName = $(event).find("#cal-name").val();
    let calActivities = $(event).find('#selected-activities').find('.activity-name');
    let activityList = []

    calActivities.each(function() {
        activityList.push($(this).text())
    })

    chrome.storage.sync.set({ [calName] : activityList }, function(){
        chrome.storage.sync.get('calendars', function(items){
            let calendarList = []

            if(items.calendars != undefined) {
                calendarList = items.calendars
            }
            calendarList.push(calName)

            chrome.storage.sync.set({'calendars': calendarList}, updateOneCalendar(calName))
        });
    });
}

function loadCalendarsFromStorage() {
    chrome.storage.sync.get('calendars', function(data){
        if(data.calendars != undefined && $('#calendar-container').length) {
            let calArr = data.calendars
            let items = []

            calArr.forEach(cal => {
                items.push( '<div class="list-group-item added">\n' + 
                            '   <div class="calendar-name">' + cal + '</div>\n' + 
                            '   <button type="button" id="remove-calendar" class="btn primary remove-btn">Remove</button>\n' + 
                            '</div>')
            });

            $(items.join('')).appendTo('#calendar-container')
        }
    })
}

function removeCalendarFromStorage(calName) {
    chrome.storage.sync.remove(calName, function() {
        chrome.storage.sync.get('calendars', function(data){
            let calArr = data.calendars
            let index = calArr.indexOf(calName)
            
            if(index > -1) {
                calArr.splice(index, 1)
            }

            chrome.storage.sync.set({'calendars': calArr})
        })
    })
}

function switchToIndex() {
   window.location.href = '../html/index.html';
}

function updateOneCalendar(calName) {
    console.log('start of updateOneCalendar')

    chrome.storage.sync.get(calName, function(data){
        let activityList = data[calName]
        scrapeEvents(activityList, 0, calName)
    })
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
function scrapeEvents(activities, numWeeksForward, calName) {
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
    .then(function(html) {
        page = $(new DOMParser().parseFromString(html['html'], "text/html"))[0]

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
        
        chrome.runtime.sendMessage(
            {   
                message: "addToCalendar",
                calendarName: calName,
                activities: eventList
            }, (response) => {
                console.log('Response from script.js chrome.runtime.sendMessage()', response)
                switchToIndex()
            }
        )
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
    });
}

$(document).ready(function() {
    loadCalendarsFromStorage()

    //Testing Method for clearing storage
    $('#clear-storage').click(function() {
        chrome.storage.sync.clear(function() {
            let error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            } else {
                console.log('storage cleared')
            }
        });
    })

    //Positions back & closer buttons appropriately
    $('.btn-close').css('translate', function() {
        let btnHeight = $(this).outerHeight()
        let containerHeight = $('.container.title').outerHeight()
        let yOffset = containerHeight/2 - btnHeight/2
        let yDist = (yOffset).toString() + 'px'
        let result = 0;

        if($(this).hasClass('close')) {
            result = '-' + yDist + ' ' + yDist
        } else {
            result = yDist + ' ' + yDist
        }
        
        return result;
    })

    $(".btn-close.close").click(function() {
        window.close();
    });

    $("#create-calendar-form").click(function() {
        window.location.href = '../html/create_calendar.html';
        $("#cal-name").tooltip(
            {
                animation: true,
            }
        );
        $("#activities").tooltip(
            { 
                animation: true,
            }
        );

        $("#cal-name").tooltip('disable');
        $("#activities").tooltip('disable');
    });

    $(".btn-close.back-arrow").click(function() {
        window.location.href = '../html/index.html';
    });

    $(".activity-container-search").click(function() {
        $('.activity-container').toggleClass('show')
    });

    //Adding activity list to page
    if($('.activity-container').length) {
        $.getJSON("../assets/activities.json", function(data) {
            let activities = data.activities;
            let activityArray = [];
            let i = 0;
            
            $.each(activities, function() {
                activityArray.push('<div class="list-group-item searchable">' + activities[i].name + '</div>\n');
                i += 1;
            })
            
            $(activityArray.join("")).appendTo('.activity-container')
        });
    }

    //Hiding/showing activity list
    $(document).on("click", function (event) {
        let opened = $('.activity-container').hasClass('show')
        let clickLoc = $(event.target)
        
        if(opened === true && !clickLoc.hasClass('activity-container-search')) {
            $('.activity-container').toggleClass('show')
        }
    });

    //Searching activity list
    $(document).on("keyup", '#activities' ,function() {
        let value = $(this).val().toLowerCase();
        $(".activity-container div").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    //Adding new activity to selected activities list
    $(document).on('click', '.list-group-item.searchable', function() {
        let newActivity = addActivity($(this).text())
        $(newActivity).appendTo("#selected-activities")
        $(this).remove()
    })

    //Adding remove button to selected activities
    $(document).on('mouseenter', '#selected-activities > .list-group-item' , function() {
        $(this).find('button').css('display', 'block')
    })

    //Removing remove button from selected activities
    $(document).on('mouseleave', '#selected-activities > .list-group-item' , function() {
        $(this).find('button').css('display', 'none')
    })

    //Adding remove button to calendars
    $(document).on('mouseenter', '#calendar-container > .list-group-item' , function() {
        $(this).find('button').css('display', 'block')
    })

    //Removing remove button from calendars
    $(document).on('mouseleave', '#calendar-container > .list-group-item' , function() {
        $(this).find('button').css('display', 'none')
    })

    //Click event for remove button on selected activities
    $(document).on('click', '.remove-activity', function() {
        let sibling = $(this).siblings()
        let parent = $(this).parent()
        
        $(this).remove()
        $(sibling).removeClass('added activity-name')
        $(sibling).addClass('list-group-item searchable')
        $(sibling).appendTo($('.activity-container'))
        $(parent).remove()
    })

    //Click event for remove calendar activity
    $(document).on('click', '#remove-calendar', function() {
        let calName = $(this).siblings().text()

        removeCalendarFromStorage(calName)
        $(this).parent().remove()
    })

    //Adds form submit validity checking
    $('.needs-validation').on('submit', function(event) {
        event.preventDefault()
        event.stopPropagation()

        console.log('Form submitted')

        if(checkFormValidity(event.target)) {
            console.log('Valid Form Submitted')
            saveCalendarToStorage(event.target)
        } else {
            console.log('Invalid Form Submitted')
        }
    })
})