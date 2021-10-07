// Global PizzaData
let pizzaData = {};
/*==============================================
 * PAGE LOAD
 * init vars and run 1-off functions
 *==============================================*/

$(function() {
    var redGreen = localStorage.getItem("redGreen");
    if(redGreen === "true") {
        $("#hamburger a").css("color", "#F6F4D3");
    }
    // See if navigated from portfolio
    let url = window.location.href;
    if (url.includes("showAllPages")) {
        $(".commercialUse").toggleClass("commercialUse DisplayAboutContact");
    }
    // add the toppings to the forms that need them
    // get the JSON pizza data and store it locally instead of requesting it multiple times
    $.getJSON("https://clcooley10.github.io/pizzaData.json", function(data) {
        pizzaData = data;
        displayToppings();
    });

});
/*==============================================
 * PAGE LOAD
 * display pizza logos if page is active
 *==============================================*/
$( async function() {
    var cur = 1;
    while ( $('#welcome-content').hasClass("show")) {
        await new Promise(r => setTimeout(r, 5000));
        $('#pizza'+cur).toggleClass("show hide");
        cur = (cur < 6) ? (cur + 1) : 1;
        $('#pizza'+cur).toggleClass("show hide");
    }
});
/*==============================================
 * Nav bar display
 * display or hide nav bar on hamburger icon click
 *==============================================*/
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
/*==============================================
 * Display main content
 * Change active content based on nav button click
 *==============================================*/
$('a.nav').click(function() {
    // hide the currently active page
    $('div.page.show').toggleClass("show hide");
    var id=$(this).attr("id");
    // if currently hidden, show, intuitively - if not hidden do nothing
    if( $('#'+id+'-content').hasClass("hide")) {
        $('#'+id+'-content').toggleClass("show hide")
    }
});
/*==============================================
 * Display user cards
 * On navigation to page, display all existing user cards
 *==============================================*/
$('#select-users').click(displayCards);
function displayCards() {
    // Clean up old cards before displaying them again
    $('.userCreated').remove();
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    if (usersObj !== null) {
        for (const [_,user] of Object.entries(usersObj)) {
            let card = document.createElement("div");
            let icon = document.createElement("img");
            let trashcan = document.createElement("img");
            $(card).addClass("user-card userCreated");
            $(trashcan).addClass("trash-img");
            $(icon).attr("src", `profile-icons/${user["icon"]}-100.png`);
            $(icon).attr("alt", "user icon");
            $(trashcan).attr("src", "images/trashcan.png");
            $(trashcan).attr("alt", "delete user card");
            $(card).append(trashcan);
            $(card).append(icon);
            $(card).append(`<p class="name-on-card">${user["user-name"]}</p>`);
            $('#display-users').append(card);
          }
    }
}
/*==============================================
 * Create a new user card
 * Navigate to the create page
 *==============================================*/
$("#new-user-card").click(function() {
    $('div.page.show').toggleClass("show hide");
    $('#create-users-content').toggleClass("show hide");
});
/*==============================================
 * Highlight Selected User
 * Change opacity to show card has been clicked and is "active"
 *==============================================*/
$(document).on('click', '.userCreated', function(event) {
    // if they actually clicked on the trash can, don't select it, delete it
    if (event.target.classList.contains("trash-img")) {
        deleteCard(event);
    } else {
        $(this).toggleClass("activeCard");
    }
    // Allow them to click "Continue!" button if at least one is selected
    if ($('.activeCard').length) {
        $('#create-order').prop('disabled', false);
    } else {
        $('#create-order').prop('disabled', true);
    }
});
/*==============================================
 * Delete User Card
 * Removes the user card from local storage and frees up the user name
 *==============================================*/
function deleteCard(event) {
    let userName = event.currentTarget.childNodes[2].innerHTML;
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    delete usersObj[userName];
    localStorage.setItem("userCards", JSON.stringify(usersObj));
    displayCards();
}
/*==============================================
 * Handle Update Preferences Form Submission
 * Returns a promise so calling function will wait for form to be submitted before
 * continuing to the next active user in the list.
 *==============================================*/
function handleUpdateSubmit(userData) {
    return new Promise(function(resolve, reject) {
        $('#update-preferences-form').submit(function(event) {
            event.preventDefault();
            let formData = $(this).serializeArray();
            let i = 0; formLength = formData.length;
            let parsedData = {};
            let toppings = [];
            while(i < formLength) {
                let key = formData[i]["name"];
                if (key !== "topping") {
                    parsedData[key] = formData[i]["value"];
                } else {
                    toppings.push(formData[i]["value"]);
                }
                i++;
            }
            parsedData["toppings"] = toppings;
            resolve(parsedData);
        });
    });
}
/*==============================================
 * Update user preferences
 * When a user clicks continue to order, make sure their current preferences are correct
 * Update local Storage with any changes to their answers
 *==============================================*/
$('#create-order').click(async function() {
    $('div.page.show').toggleClass("show hide");
    $('#update-preferences-content').toggleClass("show hide");
    let users = $('.activeCard');
    let activeUserNames = [];
    users.each(function() {
        activeUserNames.push(this.childNodes[2].innerHTML);
    });
    // Make sure the above people's wants are accurate from stored data
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    for(const [_, userData] of Object.entries(usersObj)) {
        // if the user is active
        if(activeUserNames.includes(userData["user-name"])) {
            updateUserAnswers(userData);
            let newData = await handleUpdateSubmit(userData);
            console.log("newData:", newData);
            userData["user-appetite"] = newData["user-appetite"];
            userData["user-fav-franchise"] = newData["user-fav-franchise"];
            userData["user-bad-franchise"] = newData["user-fav-franchise"];
            userData["toppings"] = newData["toppings"];
            userData["user-addWeight"] = newData["user-addWeight"];
            // Now that the indv user is updated, update the collection
            usersObj[userData["user-name"]] = userData;
        }
    }
    localStorage.setItem("userCards", JSON.stringify(usersObj));
    computeOrder(activeUserNames);
});
/*==============================================
 * Update User Answers
 * Display their old answers as pre-selected and display name at top of page
 *==============================================*/
function updateUserAnswers(userData) {
    $('#name-updateForm').html(userData["user-name"]);
    $('#update-appetite').val(userData['user-appetite']);
    updateToppings(userData["toppings"]);
    let favFranchise = `#FAV${userData['user-fav-franchise']}`;
    $(favFranchise).prop("selected", true);
    let badFranchise = `#BAD${userData['user-bad-franchise']}`;
    $(badFranchise).prop("selected", true);
    let newWeight = `#WEIGHT${userData['user-addWeight']}`;
    $(newWeight).prop("selected", true);
}
/*==============================================
 * Display toppings
 * Displays all the pizza toppings in the form
 *==============================================*/
function displayToppings() {
    let meats = pizzaData["master-toppings"]["meats"];
    let nonMeats = pizzaData["master-toppings"]["non-meats"];
    let i = 0, numMeats = meats.length;
    while(i < numMeats) {
        var wrapper = document.createElement("div");
        $(wrapper).addClass("force-wrap");
        let input = `<input type='checkbox' id='${meats[i]}' name='topping' value='${meats[i]}'>`;
        let label = `<label for='${meats[i]}'>${meats[i]}</label>`;
        $(wrapper).append(input);
        $(wrapper).append(label);
        $('.display-meats').append(wrapper);
        i++;
    }
    let j = 0; numNonMeats = nonMeats.length;
    while(j < numNonMeats) {
        var wrapper = document.createElement("div");
        $(wrapper).addClass("force-wrap");
        let input = `<input type='checkbox' id='${nonMeats[j]}' name='topping' value='${nonMeats[j]}'>`;
        let label = `<label for='${nonMeats[j]}'>${nonMeats[j]}</label>`;
        $(wrapper).append(input);
        $(wrapper).append(label);
        $('.display-nonMeats').append(wrapper);
        j++;
    }
}
/*==============================================
 * Update the Toppings
 * Show toppings as pre-checked if they previously ordered those toppings
 *==============================================*/
function updateToppings(newToppings) {
    // Uncheck all previously checked toppings
    let oldToppings = $('input[name="topping"]');
    oldToppings.prop("checked", false);
    let i = 0, numToppings = oldToppings.length;
    while(i < numToppings) {
        // if the user selected this topping when they submitted the form last
        if(newToppings.includes(oldToppings[i].value)) {
            oldToppings[i].checked = true;
        }
        i++;
    }
}
/*==============================================
 * Handle Create Form
 * Parse form submission and create new user card
 *==============================================*/
$('#create-user-form').submit(function(event) {
    event.preventDefault();
    // Convert the form responses to a dict
    var formData = $(this).serializeArray();
    let i = 0; formLength = formData.length;
    let parsedData = {};
    let toppings = [];
    while(i < formLength) {
        let key = formData[i]["name"];
        if (key !== "topping") {
            parsedData[key] = formData[i]["value"];
        } else {
            toppings.push(formData[i]["value"]);
        }
        i++;
    }
    parsedData["toppings"] = toppings;
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    if (usersObj === null) {    // if this is the first user
        usersObj = {};
    }
    // ensure the unique name is actually unique
    if (usersObj.hasOwnProperty([parsedData["user-name"]])) {
        alert("Name already in use");
        return;
    }
    // Sanitize text input
    if (!parsedData["user-name"].match(/^[\w\s]+$/)) {
        alert("No special characters");
        return;
    }
    usersObj[parsedData["user-name"]] = parsedData;
    // Push updated Users list to storage
    let jsonString = JSON.stringify(usersObj);
    localStorage.setItem("userCards", jsonString);
    // Reset the form for next time
    $('#create-user-form')[0].reset();
    // Return to previous (select users) screen
    $('#create-users-content').toggleClass("show hide");
    $('#select-users-content').toggleClass("show hide");
    displayCards();
});
/*==============================================
 * Computes the order
 * This is the "main" function of the computation. Calls
 * helper functions as needed.
 *==============================================*/
function computeOrder(userNames) {
    // Display results page
    $('div.page.show').toggleClass("show hide");
    $('#create-order-content').toggleClass("show hide");

    // Figure out how much pizza is needed
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    let activeUsersObj = {};
    let numSlices = 0;
    for( [_, userData] of Object.entries(usersObj)) {
        if(userNames.includes(userData["user-name"])) {
            activeUsersObj[userData["user-name"]] = userData;
            numSlices += userData["user-appetite"];
        }
    }
    let area = getArea(numSlices);
    console.log("area",area);

    // Figure out order for each franchise
    let franchises = ["cottageInn", "dominos", "hungryHowies", "littleCeasars", "papaJohns", "pizzaHut"];
    let orders = {};
    franchises.forEach(element => {
        orders[element] = getOrder(element, activeUsersObj);
    });
}
/*==============================================
 * pizzaArea
 * Determines the amount of pizza needed based on the number of slices requested
 *==============================================*/
function getArea(slices) {
    // A = pi * r**2 -> r = 6 -> A = 36*pi A_slice = 36*pi / 8 = 4.5*pi
    return (4.5 * Math.PI * slices);
}
/*==============================================
 * Find best order for passed franchise
 *==============================================*/
function getOrder(franchise, users) {
    console.log("Getting order for ", franchise);
    let franchiseObj = pizzaData["franchise"][franchise];
    
}
/*==============================================
 * Display final order
 *==============================================*/
function displayOrder() {
    //TODO
}
/*==============================================
 * Update Settings
 *==============================================*/
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