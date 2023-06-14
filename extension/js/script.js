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
        // $(event).find() #Add Form Input Error Message
    }

    //Checking for valid number of activities selected
    if(numActivitiesSelected < 1) {
        returnVal = false;
        // $(event).find() #Add Form Input Error Message
    }

    return returnVal;
}

function saveCalendarToStorage(event) {
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
//    window.location.href = '../html/index.html';
}

function updateOneCalendar(calName) {
    chrome.storage.sync.get(calName, function(data){
        let activityList = data[calName]
        
        chrome.runtime.sendMessage(data, function(response) {
            console.log("script:" + response)
        })

    })
}

$(document).ready(function() {
    loadCalendarsFromStorage()

    //Testing Method for clearing storage
    $('#clear-storage').click(function() {
        chrome.storage.sync.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            } else {
                console.log('storage cleared')
            }
        });
    })

    //Testing Fetch
    $('#fetch').click(function() {
        console.log("fetching")
        const URL = "http://localhost:8000/heloooooo"
        fetch(URL)
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
        var value = $(this).val().toLowerCase();
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

        if(checkFormValidity(event.target)) {
            saveCalendarToStorage(event.target)
            switchToIndex()
        }
    })
})