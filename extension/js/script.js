function addActivity(activityName) {
    return '<div class="list-group-item added"> <div class="activity-name">' + activityName + '</div></div>\n'
}

$(document).ready(function() {
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

    $(document).on("click", function (event) {
        let opened = $('.activity-container').hasClass('show')
        let clickLoc = $(event.target)
        
        if(opened === true && !clickLoc.hasClass('activity-container-search')) {
            $('.activity-container').toggleClass('show')
        }
    });

    //Searching
    $(document).on("keyup", '#activities' ,function() {
        var value = $(this).val().toLowerCase();
        $(".activity-container div").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on('click', '.list-group-item.searchable', function() {
        let newActivity = addActivity($(this).text())
        $(newActivity).appendTo("#selected-activities")
        $(this).remove()
    })

    $(document).on('mouseenter', '#selected-activities > .list-group-item' , function() {
        $('<button type="button" class="btn primary remove-btn">Remove</button>').appendTo($(this))
    })

    $(document).on('mouseleave', '#selected-activities > .list-group-item' , function() {
        $(this).children('button').remove()
    })

    $(document).on('click', '.remove-btn', function() {
        let sibling = $(this).siblings()
        let parent = $(this).parent()
        
        $(this).remove()
        $(sibling).removeClass('added activity-name')
        $(sibling).addClass('list-group-item searchable')
        $(sibling).appendTo($('.activity-container'))
        $(parent).remove()
        // $(this)remove)
    })

})