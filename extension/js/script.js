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
                activityArray.push('<li class="list-group-item">' + activities[i].name + '</li>\n');
                i += 1;
            })
            
            $(activityArray.join("")).appendTo('.activity-container')
        });
    }

    $(document).on("click", function (event) {
        let opened = $('.activity-container').hasClass('show')
        let clickLoc = $(event.target)
        
        console.log(opened)
        if(opened === true && !clickLoc.hasClass('activity-container-search')) {
            console.log(clickLoc)
            $('.activity-container').toggleClass('show')
        }
    });

    //Searching
    $("#activities").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".activity-container li").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
})