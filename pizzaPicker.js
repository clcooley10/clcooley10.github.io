var redGreen = false,
    users = null;
// On page load, init vars stored in local storage
$(function() {
    redGreen = localStorage.getItem("redGreen");
    users = localStorage.getItem("userCards");
    if(redGreen === "true") {
        $("#hamburger a").css("color", "#F6F4D3");
    }
    // See if navigated from portfolio
    let url = window.location.href;
    if (url.includes("showAllPages")) {
        $(".commercialUse").toggleClass("commercialUse DisplayAboutContact");
    }
});
// On page load, display pizza logos if page is active
$( async function() {
    var cur = 1;
    while ( $('#welcome-content').hasClass("show")) {
        await new Promise(r => setTimeout(r, 5000));
        $('#pizza'+cur).toggleClass("show hide");
        cur = (cur < 6) ? (cur + 1) : 1;
        $('#pizza'+cur).toggleClass("show hide");
    }
});
/* Open and close the nav */
$('#changeNavDisplay').click(function() {
    // Currently open, being closed
    if( $('#hamburger').hasClass("open")) {
        $('#hamburger').removeClass("open").addClass("closed");
        $('#main-content').css("margin-left", "2rem");
    } else {
        $('#hamburger').removeClass("closed").addClass("open");
        $('#main-content').css("margin-left", "15rem");
    }
});
// Change page content on nav button click
$('a.nav').click(function() {
    // hide the currently active page
    $('div.page.show').toggleClass("show hide");
    var id=$(this).attr("id");
    // if currently hidden, show, intuitively - if not hidden do nothing
    if( $('#'+id+'-content').hasClass("hide")) {
        $('#'+id+'-content').toggleClass("show hide")
    }
});
// Create a new user card
$("#new-user-card").click(function() {
    $('div.page.show').toggleClass("show hide");
    $('#create-users-content').toggleClass("show hide");
});

// Update Settings
$("#settingsForm").submit(function(event) {
    event.preventDefault();
    var formData = $(this).serialize();
    if (formData.includes("redGreen")) {
        localStorage.setItem("redGreen", true);
        $("#hamburger a").css("color", "#F6F4D3");
    }
    if (formData.includes("clearData")) {
        localStorage.clear();
        window.location.reload();
    }
});