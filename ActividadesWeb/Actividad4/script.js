$(document).ready(function() {
    
    $(".dayButton").click(function() {
        let day = $(this).data("day");
        $(".menuLayout").removeClass("active");
        $("#" + day).addClass("active");
        $(".dayButton").removeClass("selected");
        $(this).addClass("selected");
    });
});