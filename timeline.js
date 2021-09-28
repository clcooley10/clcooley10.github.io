const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-bar ul');
const navLinks = document.querySelectorAll('.nav-bar a');

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
function addSVG() {
    let entries = document.getElementsByClassName("entry");
    var svgs = document.getElementsByClassName("svg");
    var i = 0, numSVG = entries.length - 1;
    let width = svgs[0].clientWidth;
    while (i < numSVG) {
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        // If we have already created an SVG here, destroy it first
        if (svgs[i].lastChild) {
            svgs[i].removeChild(svgs[i].lastChild);
        }
        svgs[i].appendChild(polygon);
        //if we're going left to right
        if (i % 2 === 0) {
            // top left
            var point1 = svgs[i].createSVGPoint();
            point1.x = width * 0.05;
            point1.y = 0;
            // top right
            var point2 = svgs[i].createSVGPoint();
            point2.x = width * 0.45;
            point2.y = 0;
            // bottom right
            var point3 = svgs[i].createSVGPoint();
            point3.x = width * 0.55;
            point3.y = 320;
            // bottom left
            var point4 = svgs[i].createSVGPoint();
            point4.x = width * 0.95;
            point4.y = 320;
            // add gradient
            polygon.setAttribute('fill', 'url(#blue-yellow)');
        } else { // if we're going right to left
            // top left
            var point1 = svgs[i].createSVGPoint();
            point1.x = width * 0.55;
            point1.y = 0;
            // top right
            var point2 = svgs[i].createSVGPoint();
            point2.x = width * 0.95;
            point2.y = 0;
            // bottom right
            var point3 = svgs[i].createSVGPoint();
            point3.x = width * 0.05;
            point3.y = 320;
            // bottom left
            var point4 = svgs[i].createSVGPoint();
            point4.x = width * 0.45;
            point4.y = 320;
            // add gradient
            polygon.setAttribute('fill', 'url(#yellow-blue)');
        }
        // add all points to the polygon
        polygon.points.appendItem(point1);
        polygon.points.appendItem(point2);
        polygon.points.appendItem(point4);
        polygon.points.appendItem(point3);
        i++;
    }
}
window.addEventListener('load', addSVG);
window.addEventListener('resize', addSVG);