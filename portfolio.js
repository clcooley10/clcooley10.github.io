let insertNameHere = document.getElementsByClassName("guest-name");
let to_fill = document.getElementById("browser-width");
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-bar ul');
const navLinks = document.querySelectorAll('.nav-bar a');

// On initial page load
window.addEventListener('load', pageLoad);

function pageLoad() {
  // Ask guest to enter name
  let guestName = prompt("Please enter your name, leave blank for pseudonym Sam", "Sam");
    if (guestName[0] === '<' || guestName[0] === '&') {
      alert("Why yes I did barely sanitize this input! I'll just call you hacker.");
      guestName = "hacker";
    }
    else if (guestName === "") {
      guestName = "Sam";
    }
  var i = 0, len = insertNameHere.length;
  while (i < len) {
    insertNameHere[i].innerHTML = guestName;
    i++;
  }
  // Prep to show their screen size
  let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  to_fill.innerHTML = width;
}

// When the page is resized
window.addEventListener('resize', pageResize);

function pageResize() {
  // Update the display of the current window size
  let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  to_fill.innerHTML = width;

  // Don't tell people to try the mobile if already on mobile
  if (window.screen.width < 650) {
    document.getElementById("show_on_desktop").innerHTML = "Open the menu to view options!";
  } else {
    document.getElementById("show_on_desktop").innerHTML = "Get your money's worth, mobile starts at 650px";
  }
}

// These functions handle updating the nav bar menu display
allEventListners();

function allEventListners() {
  hamburger.addEventListener('click', togglerClick);
}
function togglerClick() {
  hamburger.classList.toggle('toggler-open');
  navMenu.classList.toggle('open');
}
function navLinkClick() {
  if(navMenu.classList.contains('open')) {
    navToggler.click();
  }
}
function hidePic() {
  var greeting = document.getElementById("greeting");
  var altGreeting = document.getElementById("alt-greeting")
  if (greeting.style.display === "none") {
    greeting.style.display = "flex"
    altGreeting.style.display = "none"
  } else {
    greeting.style.display = "none";
    altGreeting.style.display = "flex"
  }
}