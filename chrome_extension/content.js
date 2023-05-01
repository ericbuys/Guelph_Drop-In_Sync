$(document).ready(function() {
    // Loading Activity List on Webpage
    if($('.activity-container').length) {

        $.getJSON("./assets/activities.json", function(data) {
            let activities = data.activities;
            let activityArray = [];
            let i = 0;
            
            $.each(activities, function() {
                activityArray.push('<div class="activity">' + activities[i].name + '</div>\n');
                i += 1;
            })
            
            $(activityArray.join("")).appendTo('.activity-container')
        });
    }

    $(".close.button").click(function() {
        window.close();
    });

    $(".back-button-container").click(function() {
        window.location.href = 'index.html';
    })

    $("#create-calendar-form").click(function() {
        window.location.href = 'create_calendar.html';
    });

    $("#create-calendar").click(function() {
        window.location.href = 'index.html';
    });

    $("#activity-search").click(function() {
        $('.activity-container').toggleClass('inactive')
        $('.activity-container').toggleClass('active')
    });

    $(document).on("click", function (event) {
        if ($('.activity-container').length && $('.activity-container').hasClass('active') && ($(event.target).closest("#activity-search").length === 0 && $(event.target).closest(".activity-container").length === 0)) {
            $('.activity-container').toggleClass('inactive')
            $('.activity-container').toggleClass('active')
        }
    });
});