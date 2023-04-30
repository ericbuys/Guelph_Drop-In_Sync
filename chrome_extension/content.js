$(document).ready(function() {
    $(".close-button").click(function() {
        window.close();
    });

    $("#create-calendar-form").click(function() {
        window.location.href = 'create_calendar.html';
    });

    $("#create-calendar").click(function() {
        window.location.href = 'index.html';
    });
});