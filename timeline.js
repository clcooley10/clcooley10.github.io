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
// this returns the user back to the main page
document.getElementById("back-btn").addEventListener('click', function() {
    location.href = "portfolio.html";
});

// This dynamically adds the svgs based on the screen size
function addSVG() {
    let svgs = document.getElementsByClassName("svg");
    var i = 0, numSVG = svgs.length;
    let width = svgs[0].clientWidth;
    while (i < numSVG) {
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        // If we have already created an SVG here, destroy it first
        if (svgs[i].lastChild) {
            svgs[i].removeChild(svgs[i].lastChild);
        }
        svgs[i].appendChild(polygon);

        // We have made a polygon, now figure out where the points (corners) are
        var topLeft, topRight, bottomLeft, bottomRight;
        var topY = 0, bottomY = 320; //all svgs have height of 20rem = 320px
        var gradientDirection;
        // if we are in mobile view
        if (width <= 750) {
            topLeft = 0.1, topRight = 0.9, bottomLeft = topLeft, bottomRight = topRight;
        } else {
            // first case, going into events
            if (i === 0) {
                topLeft = 0.05, topRight = 0.95, bottomLeft = topLeft, bottomRight = 0.45;
            }
            // last case, going into contact
            else if (i === numSVG - 1) {
                topLeft = 0.55, topRight = 0.95, bottomLeft = 0.05, bottomRight = topRight;
            }
            //if we're going left to right
            else if (i % 2 === 1) {
                topLeft = 0.05, topRight = 0.45, bottomLeft = 0.55, bottomRight = 0.95;
            } else { // if we're going right to left
                topLeft = 0.55, topRight = 0.95, bottomLeft = 0.05, bottomRight = 0.45;
            }
        }
        // Figure out which color direction we are going
        if (i % 2 === 0) {
            gradientDirection = 'url(#yellow-blue)';
        } else {
            gradientDirection = 'url(#blue-yellow)';
        }
        // top left
        var point1 = svgs[i].createSVGPoint();
        point1.x = width * topLeft;
        point1.y = topY;
        // top right
        var point2 = svgs[i].createSVGPoint();
        point2.x = width * topRight;
        point2.y = topY;
        // bottom right
        var point3 = svgs[i].createSVGPoint();
        point3.x = width * bottomRight;
        point3.y = bottomY;
        // bottom left
        var point4 = svgs[i].createSVGPoint();
        point4.x = width * bottomLeft;
        point4.y = bottomY;
        // add gradient
        polygon.setAttribute('fill', gradientDirection);
        // add all points to the polygon
        polygon.points.appendItem(point1);
        polygon.points.appendItem(point2);
        polygon.points.appendItem(point3);
        polygon.points.appendItem(point4);
        i++;
    }
}
window.addEventListener('load', addSVG);
window.addEventListener('resize', addSVG);