let insertNameHere = document.getElementsByClassName("guest-name");

// On initial page load, alert the guest, and ask to enter their name
window.onload = function() {
    let guestName = prompt("Please enter your name, leave blank for pseudonym Sam", "Sam");
    var i = 0, len = insertNameHere.length;
    while (i < len) {
        insertNameHere[i].innerHTML = guestName;
        i++;
    }
}