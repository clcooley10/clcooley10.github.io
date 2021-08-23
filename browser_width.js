let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
let to_fill = document.getElementById("browser-width")
window.onload = function() {
    to_fill.innerHTML = width;
}
window.onresize = function() {
    to_fill.innerHTML = width;
    //Don't tell people to try the mobile if already on mobile
    if (window.screen.width < 650) {
        document.getElementById("show_on_desktop").innerHTML = "Open the menu to view options!";
    }
}
