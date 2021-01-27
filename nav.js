const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-bar ul');
const navLinks = document.querySelectorAll('.nav-bar a');

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

