$(".dayButton").click(function() {

    let day = $(this).data("day");

    $(".menuLayout.active").fadeOut(200, function() {
        
       
        $(this).removeClass("active");

        $("#" + day).fadeIn(200).css("display", "flex").addClass("active");

    });

});