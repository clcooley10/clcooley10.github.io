// Global PizzaData
let pizzaData = {};
/*==============================================
 * PAGE LOAD
 * init vars and run 1-off functions
 * Includes:
 ***Fixes red on green text for RG colorblind folks
 ***Includes additional pages if navigating from portfolio
 ***Getting PizzaData
 ***Displaying toppings for forms
 ***Loading previous orders
 *==============================================*/
$(function() {
    var redGreen = localStorage.getItem("redGreen");
    if(redGreen === "true") {
        $('#hamburger a').css("color", "#F6F4D3");
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
    displayPrevOrders();

});
/*==============================================
 * PAGE LOAD
 * display pizza logos if page is active
 *==============================================*/
$( async function() {
    var cur = 1;
    while ( $('#welcome-content').hasClass("show")) {
        console.log("running line 33");
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
        $('#main-content').css("margin-left", "2rem");
    } else {
        $('#main-content').css("margin-left", "15rem");
    }
    $('#hamburger').toggleClass("open closed");
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
    //Set once instead of passing to functions
    localStorage.setItem("activeUsers",JSON.stringify(activeUserNames));
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
            userData["user-bad-franchise"] = newData["user-bad-franchise"];
            userData["toppings"] = newData["toppings"];
            //userData["user-addWeight"] = newData["user-addWeight"];
            // Now that the indv user is updated, update the collection
            usersObj[userData["user-name"]] = userData;
        }
    }
    localStorage.setItem("userCards", JSON.stringify(usersObj));
    computeOrder();
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
    //let newWeight = `#WEIGHT${userData['user-addWeight']}`;
    //$(newWeight).prop("selected", true);
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
    // Sanitize text input (barely)
    if (!parsedData["user-name"].match(/^[\w\s]+$/)) {
        alert("No special characters");
        return;
    }
    usersObj[parsedData["user-name"]] = parsedData;
    // Push updated Users list to storage
    localStorage.setItem("userCards", JSON.stringify(usersObj));
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
function computeOrder() {
    // Display results page
    $('div.page.show').toggleClass("show hide");
    $('#create-order-content').toggleClass("show hide");

    // Figure out how much pizza is needed
    let userNames = JSON.parse(localStorage.getItem("activeUsers"));
    let usersObj = JSON.parse(localStorage.getItem("userCards"));
    let activeUsersObj = {};
    let numSlices = 0;
    for( [_, userData] of Object.entries(usersObj)) {
        if(userNames.includes(userData["user-name"])) {
            activeUsersObj[userData["user-name"]] = userData;
            numSlices += parseInt(userData["user-appetite"]);
        }
    }
    let area = getArea(numSlices, 6, 8);
    console.log("area",area);

    // Figure out order for each franchise
    let franchises = ["cottageInn", "dominos", "hungryHowies", "littleCaesars", "papaJohns", "pizzaHut"];
    let orders = {};
    franchises.forEach(element => {
        orders[element] = getOrder(element, activeUsersObj, area);
    });
    displayOrder(orders, activeUsersObj);
}
/*==============================================
 * pizzaArea
 * Determines the amount of pizza needed based on the number of slices requested
 *==============================================*/
function getArea(slices, radius, slicesPerPizza) {
    return (radius * radius * Math.PI * slices) / slicesPerPizza;
}
/*==============================================
 * This is a pizza object used to make orders
 *==============================================*/
function Pizza(q1,q2,q3,q4,radius,onQuarter) {
    this.q1 = q1;
    this.q2 = q2;
    this.q3 = q3;
    this.q4 = q4;
    this.radius = radius;
    this.onQuarter = onQuarter;
}
/*==============================================
 * Find best order for passed franchise
 *==============================================*/
function getOrder(franchise, users, totalArea) {
    let sizes = ["small", "medium", "large", "x-large"];
    // pizza radius [sm, med, lg, x-lg]
    let radii = [5,6,7,8];
    let sizeArea = [];
    let slices = [];
    let availSizes = [];
    let franchiseObj = pizzaData[franchise];
    let i = 0, len = sizes.length;
    // Do two things at once, find area for each size, and find numSlices for each size
    while(i < len) {
        // if franchise has this size pizza, get slices
        if(franchiseObj["pizzas"].hasOwnProperty(sizes[i]) && (franchiseObj["pizzas"][sizes[i]] !== null)) {
            availSizes.push(sizes[i]);
            slices[i] = franchiseObj["pizzas"][sizes[i]]["slices"];
            sizeArea.push(radii[i] * radii[i] * Math.PI);
        } else {
            slices.push(0);
            // this is well over 100 x-lg pizzas
            sizeArea.push(21000);
        }
        i++;
    }
    /* Calculating the num pizzas by largest to smallest is not necessarily optimal
     but it is easier and cheaper than doing small to large. There will almost always be extra.*/
    let numPizzas = [];
    i = sizes.length - 1;
    let areaCopy = totalArea;
    while(i >=  0) {
        let numPizza = 0;
        if(availSizes.includes(sizes[i])) {
            while(areaCopy >= sizeArea[i]) {
                areaCopy -= sizeArea[i];
                numPizza++;
            }
        }
        numPizzas.unshift(numPizza);
        i--;
    }
    // if theres remainder, order on side of extra
    if(areaCopy !== 0) {
        switch(availSizes[0]) {
            case "small":
                numPizzas[0]++;
                break;
            case "medium":
                numPizzas[1]++;
                break;
            case "large":
                numPizzas[2]++;
                break;
            case "x-large":
                numPizzas[3]++;
                break;
        }
    }
    /* Now that we know how many pizzas to order, put user's toppings on them
    This assumes that 1/4 is the smallest fraction of pizza that be split*/
    for([_,userData] of Object.entries(users)) {
        i = 0;
        let availToppings = [];
        while(i < userData["toppings"].length) {
            if(franchiseObj["toppings"].includes(userData["toppings"][i]) ||
            (franchiseObj.hasOwnProperty("premium_toppings") && 
            franchiseObj["premium_toppings"] !== null && franchiseObj["premium_toppings"].includes(userData["toppings"][i]))) {
                //they have topping
                availToppings.push(userData["toppings"][i]);
            }
            i++;
        }
        /* Even though userData is used beyond this scope, we overwrite with every franchise
        before using the values, and we never push this back to storage*/
        userData["availToppings"] = availToppings;
    }
    // Now we know what toppings can go on our pizzas from this franchise
    // Create our order
    let order = {   "small": [],
                    "medium": [],
                    "large": [],
                    "x-large": []
    };
    let x = 0;
    for(let i = 0; i < numPizzas.length; i++) {
        for(let j = 0; j < numPizzas[i]; j++) {
            order[sizes[i]].push(new Pizza([],[],[],[],radii[i], 1));
            x++;
        }
    }
    // Make an array of the users that havent been satisfied yet & track areaLeft to top
    let unSatisfiedUsers = [];
    for([userName,userData] of Object.entries(users)) {
        unSatisfiedUsers.push(userName);
        userData["areaLeft"] = getArea(userData["user-appetite"], 6, 8);
    }
    // Fill pizzas one at a time, instead of by user, by decreasing size
    let p = availSizes.length - 1;
    while(p >= 0) {
        // Early exit condition: all users are satisfied
        if(!unSatisfiedUsers.length) {
            break;
        }
        let pizzaArr = order[availSizes[p]];
        for(let i = 0; i < pizzaArr.length; i++) {
            let pizza = pizzaArr[i];
            //While this pizza is not full && there are hungry users
            while(pizza.onQuarter < 5 && unSatisfiedUsers.length) {
                // Put on toppings for this unSatisfied user
                let curUser = unSatisfiedUsers[0];
                let areaWanted = users[curUser]["areaLeft"];
                let areaPizza = getArea(1,pizza.radius,1);
                let percentWanted = areaWanted / areaPizza;
                let quartersGiven = 0;
                if(percentWanted < .5) {            //give 1/4
                    quartersGiven += 1;
                } else if(percentWanted < .75) {    //give 2/4
                    quartersGiven += 2;
                } else if(percentWanted < 1) {      //give 3/4
                    quartersGiven += 3;
                } else {                            //give 4/4
                    quartersGiven += 4;
                }
                let q = 0;
                while(q < quartersGiven && pizza.onQuarter < 5) {
                    // toppings are officially on a quarter of pizza
                    pizza[`q${pizza.onQuarter}`] = [...users[curUser]["availToppings"]];
                    // remove that quarter's area from areaLeft
                    users[curUser]["areaLeft"] -= areaPizza*.25;
                    // move to next quarter
                    pizza.onQuarter++;
                    q++;
                }
                // is the user satisfied
                if(users[curUser]["areaLeft"] <= 0) {
                    unSatisfiedUsers.splice(unSatisfiedUsers.indexOf(curUser), 1);
                }
            }
        }
        p--;
    }
    return order;
}
/*==============================================
 * Get the cost of an order
 *==============================================*/
function getCost(franchise, order) {
    let total = 0;
    let i = 0, sizes = ["small", "medium", "large", "x-large"];
    // for each size
    while(i < sizes.length) {
        let j = 0;
        // for each pizza of size
        while(j < order[sizes[i]].length) {
            let pizzaPrice = 0;
            let toppingOnQtr = 0; // used to determine how much money to refund if the first top was free
            //add the cost of the plain pizza
            pizzaPrice += pizzaData[franchise]["pizzas"][sizes[i]]["pizza_price"];
            // for each quarter of pizza
            for(let k = 1; k < 5; k++) {
                let ourToppings = order[sizes[i]][j][`q${k}`];
                let premium_tops = pizzaData[franchise]["premium_toppings"];
                if(premium_tops !== null) { // charge by topping if some have dif price
                    // for each topping
                    for(let x = 0; x < ourToppings.length; x++) {
                        toppingOnQtr++;
                        //charge premium price
                        if(premium_tops.includes(ourToppings[x])) {
                            pizzaPrice += pizzaData[franchise]["pizzas"][sizes[i]]["premium_topping_price"]*0.25;
                        } else {
                            pizzaPrice += pizzaData[franchise]["pizzas"][sizes[i]]["topping_price"]*0.25;
                        }
                    }
                } else { // all are same price
                    pizzaPrice += pizzaData[franchise]["pizzas"][sizes[i]]["topping_price"] * ourToppings.length * 0.25;
                }
            }
            // if first topping was free, and they got toppings, reduce the cost
            if(pizzaData[franchise]["first_topping_free"] && toppingOnQtr) {
                pizzaPrice -= pizzaData[franchise]["pizzas"][sizes[i]]["topping_price"]*0.25*toppingOnQtr;
            }
            total += pizzaPrice;
            j++;
        }
        i++;
    }
    return parseFloat(total.toFixed(2));
}
/*==============================================
 * Display final order
 *==============================================*/
function displayOrder(orders, users) {
    $('.result-body').remove();
    $('.rm-highlights').remove();
    let sizeOrder = ["small", "medium", "large", "x-large"];
    // Obtain totals in advance in order to add highlight for cheapest option
    let totals = [];
    let cheapFranch = "";
    let expensiveFranch = "";
    let minPrice = 9999999, maxPrice = 0;
    for([franchise, order] of Object.entries(orders)) {
        let price = getCost(franchise, order);
        if(price < minPrice) {
            minPrice = price;
            cheapFranch = franchise;
        }
        if(price > maxPrice) {
            maxPrice = price;
            expensiveFranch = franchise;
        }
        totals.push(price);
    }
    // These are highlights
    let fav = getUserOpinion(users, true);
    let leastFav = getUserOpinion(users, false);
    // Display for each place
    let totalsInd = 0;
    for([franchise,order] of Object.entries(orders)) {
        // These refer to DOM elements
        let id = `#${franchise}Results`;
        let highlightWrap = `#${franchise}Highlights`;
        let highlights = document.createElement('div');
        $(highlights).addClass("rm-highlights");
        let mainWrap = document.createElement('div');
        $(mainWrap).addClass("result-body");
        // These deal with highlights
        let total = totals[totalsInd++];
        $(mainWrap).append(`<p>Total Price: $${total}</p>`);
        let uniqueAvailToppings = [];
        // for each size
        for(let i = 0; i < sizeOrder.length; i++) {
            let sizeWrap = document.createElement('div');
            // for each pizza of size
            for(let j = 0; j < order[sizeOrder[i]].length; j++) {
                let pizzaWrap = document.createElement('div');
                $(pizzaWrap).addClass("pizza-wrap");
                let size = `<h3>${sizeOrder[i]} pizza:</h3>`;
                $(pizzaWrap).append(size);
                // for each quarter of pizza
                for(let k = 1; k < 5; k++) {
                    let toppings = "null";
                    // if they have toppings on quarter
                    let qtr = order[sizeOrder[i]][j][`q${k}`];
                    if (qtr.length) {
                        toppings = `<p>q${k} -- ${qtr.join(", ").toString()}</p>`;
                        // for each topping on this quarter
                        for(let m = 0; m < qtr.length; m++) {
                            if(uniqueAvailToppings.indexOf(qtr[m]) === -1) {
                                uniqueAvailToppings.push(qtr[m]);
                            }
                        }
                    } else {toppings = `<p>q${k} -- plain</p>`}
                    $(pizzaWrap).append(toppings);
                }
                $(sizeWrap).append(pizzaWrap);
            }
            $(mainWrap).append(sizeWrap);
        }
        $(id).append(mainWrap);
        //add highlights here
        $(highlights).append("<h1>Highlights:</h1>");
        if(franchise === cheapFranch) {
            let cheap = "<p class='green-text'>This is the least expensive order</p>";
            $(highlights).append(cheap);
        } else if(franchise === expensiveFranch) {
            let expensive = "<p class='red-text'>This is the most expensive order</p>";
            $(highlights).append(expensive);
        }
        if(franchise === fav) {
            let favorite = "<p class='green-text'>A majority said this is their favorite place</p>";
            $(highlights).append(favorite);
        } else if(franchise === leastFav) {
            let leastFavorite = "<p class='red-text'>A majority said this is their least favorite place</p>";
            $(highlights).append(leastFavorite);
        }
        // able to save computations by calculating avail toppings above
        let numAvail = uniqueAvailToppings.length;
        // Have to reloop through user preferences here to get all toppings
        let uniqueReqTop = [];
        for([_,data] of Object.entries(users)) {
            for(let y = 0; y < data["toppings"].length; y++) {
                if(uniqueReqTop.indexOf(data["toppings"][y]) === -1) {
                    uniqueReqTop.push(data["toppings"][y]);
                }
            }
        }
        let totalRequested = uniqueReqTop.length;
        let color = (numAvail / totalRequested > 0.5) ? "green" : "red"
        if(totalRequested > 0) { //Dont show if they ordered plain
            $(highlights).append(`<p class='${color}-text'>They have ${numAvail} / ${totalRequested} of your toppings</p>`);
        }
        $(highlightWrap).append(highlights);
    }
}
/*==============================================
 * getUserOpinion looks at users' (least) favorite place to rank the best/worst
 *==============================================*/
function getUserOpinion(users, favorite) {
    console.log(users);
    let tally = {
        "cottageInn": 0,
        "dominos": 0,
        "hungryHowies": 0,
        "littleCaesars": 0,
        "papaJohns": 0,
        "pizzaHut": 0
    }
    let param = null;
    if(favorite) {
        param = "user-fav-franchise";
    } else {param = "user-bad-franchise"}
    let numUsers = 0;
    for([_,userData] of Object.entries(users)) {
        tally[userData[param]]++;
        numUsers++;
    }
    //go through our tally and return the max
    let max = 0;
    let franch = "";
    for([key, val] of Object.entries(tally)) {
        if(val > max) {
            max = val;
            franch = key;
        }
    }
    // We want a strict majority
    if((max/numUsers) > 0.5) {
        return franch;
    } else {return "none"}
}
/*==============================================
 * Handle Save Order button click
 * Saves a description of the order to the view old orders page for quick reference
 *==============================================*/
$(document).on('click', '.save-order', function(event) {
    event.preventDefault();
    parseOrder(event);
    displayPrevOrders();
});
/*==============================================
 * Handle Highlight Prev order to display new one
 *==============================================*/
$(document).on('click', '.order-details', function(event) {
    let orderDiv = event.currentTarget;
    //bc these are dynamically created, the orderNum is always [1]
    let orderNum = $(orderDiv)[0].classList[1];
    //close the currently open one
    $(`.highlight.show`).toggleClass("show hide");
    $(`.highlight.hide.${orderNum}`).toggleClass("show hide");
    if($('#default-prev-highlight').hasClass("show")) {
        $('#default-prev-highlight').toggleClass("show hide");
    }
});
/*==============================================
 * Parses the completed order and creates an object needed to fill out the view old events page
 *==============================================*/
function parseOrder(data) {
    let franchise = data.target.parentElement.childNodes[1].childNodes[1].childNodes[1].innerHTML;
    franchise.replace(":","");
    //  order = what we clicked->franchiseWrapper->dynamicDiv->franchiseResults->resultsBody->All text
    let order = data.target.parentElement.childNodes[1].childNodes[1].childNodes[3].childNodes;
    console.log(order);
    let price = order[0].innerHTML;
    let activeUsers = JSON.parse(localStorage.getItem("activeUsers"));
    let obj = new Date();
    let day = String(obj.getDate()).padStart(2,'0');
    let month = String(obj.getMonth()+1).padStart(2,'0');
    let year = String(obj.getFullYear());
    let date = `Created: ${month}/${day}/${year}`;
    let i = 1;
    let pizzas = "";
    while(i < order.length) {
        if(order[i].innerText !== "") {
            let splitArr = order[i].innerText.split(":");
            let quarters = splitArr[1].split(/q[0-9]+ -- /);
            console.log(quarters);
            pizzas += `<b>${splitArr[0]}:</b><br>`;
            for(let j = 1; j < quarters.length; j++){
                pizzas += `q${j} -- ${quarters[j]}<br>`;
            }
        }
        i++
    }
    //fill in object to store
    let prevOrder = {
        "franchise": franchise,
        "activeUsers": activeUsers,
        "price": price,
        "date": date,
        "pizzas": pizzas
    }
    //get all prevOrders already stored
    let allPrev = JSON.parse(localStorage.getItem("prevOrders"));
    //if this is the first order being saved
    if(allPrev === null) {
        allPrev = {};
    }
    allPrev[`prevOrder${Object.keys(allPrev).length}`] = prevOrder;
    console.log(allPrev);
    localStorage.setItem("prevOrders", JSON.stringify(allPrev));
}
/*==============================================
 * Load Previously Saved Orders
 *==============================================*/
function displayPrevOrders() {
    //remove all old data, new one just added
    $('.order-details').remove();
    $('.highlight').remove();
    let allPrev = JSON.parse(localStorage.getItem("prevOrders"));
    //for each saved order
    if(allPrev !== null) {
        let i = 0;
        for([_,order] of Object.entries(allPrev)) {
            //for the scroll of prev orders
            let orderWrap = document.createElement('div');
            $(orderWrap).addClass(`order-details order${i}`);
            let orderTop = document.createElement('div');
            $(orderTop).addClass("order-top");

            let activeUsers = `<p>Made for ${order["activeUsers"].join(", ")}</p>`;
            let date = `<p>${order["date"]}</p>`;
            let franchise = `<h2>${order["franchise"]}</h2>`;
            let pizzas = `<p>${order["pizzas"]}</p>`;
            let price = `<p>${order["price"]}</p>`;
            $(orderTop).append(franchise);
            $(orderTop).append(date);
            $(orderWrap).append(orderTop);
            $(orderWrap).append(activeUsers);
            $('#orders-scroll').prepend(orderWrap);

            //for the selected highlighted order
            let orderHighlight = document.createElement('div');
            $(orderHighlight).addClass(`highlight hide order${i++}`);
            $(orderHighlight).append(franchise);
            $(orderHighlight).append(activeUsers);
            $(orderHighlight).append(price);
            $(orderHighlight).append(pizzas);
            $('#order-highlight').append(orderHighlight);
        }
    }
}
/*==============================================
 * Update Settings
 *==============================================*/
$("#settingsForm").submit(function(event) {
    event.preventDefault();
    var formData = $(this).serialize();
    if (formData.includes("redGreen")) {
        if($('.show.disableRG')[0] !== undefined) {
            localStorage.setItem("redGreen", true);
            $("#hamburger a").css("color", "#F6F4D3");
        } else {
            localStorage.setItem("redGreen", false);
            $("#hamburger a").css("color", "#4cbc5a");
        }
        $('.disableRG').toggleClass('show hide');
        $('.enableRG').toggleClass('show hide');
        $('#redGreen').prop('checked', false);
    }
    if (formData.includes("clearData")) {
        localStorage.clear();
        window.location.reload();
    }
});