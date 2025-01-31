//dom selectors and other setup (for the extension)
const storage = chrome.storage.local;
const monthlyParent = document.getElementById("updatableMonthlyStats");
monthlyParent.style.display = "none"; //hide the monthly 'reset' button when the extension loads
const gatherMonthlyStats = document.getElementById("monthlyStats");
const toggleDisplay = document.getElementById("toggleDarkMode");
const monthlyText = document.getElementById("monthlyStatsText");
const monthlyClear = document.getElementById("clearMonthlyStats");


//when the  monthly stats button is clicked, start the progress to gather monthly stats
gatherMonthlyStats.addEventListener("click", () => {
    monthlyParent.style.display = "block";
    send({
        content: 'get monthly stats'
    }); //send a message to background.js
});

//when the clear button is clicked, clear the monthly stats
monthlyClear.addEventListener("click", () => {
    monthlyParent.style.display = "none";
})


// testing for dark mode (will be deleted later)
let testingToggle = document.getElementById("testingToggle");
getDisplayMode().then((displayMode) => {
    testingToggle.textContent = displayMode;
});

// function to retrieve the display mode
async function getDisplayMode() {
    const result = await storage.get(["displayMode"]);
    return result["displayMode"];
}

// general dark mode function
async function changeMode() {
    let currentDisplay = await getDisplayMode();
    if (currentDisplay == "dark") {
        storage.set({
            displayMode: "light"
        }).then(() => {});
    } else {
        storage.set({
            displayMode: "dark"
        }).then(() => {});
    };
    let newDisplay = await getDisplayMode();
    testingToggle.textContent = newDisplay;
    send({
        content: "change display",
        display: newDisplay
    });
    console.log('sent');
}

// when the button to toggle dark mode is clicked, change the modes
toggleDisplay.addEventListener("click", () => {
    changeMode();
});


//message sending template
async function send(message) {
    const response = await chrome.runtime.sendMessage(message);
};

//listen for things from the other scripts
chrome.runtime.onMessage.addListener(
    async function(message, sender, sendResponse) {
        if ('monthlyStats' in message) { //if we get given monthly stats
            if (message.monthlyStats.includes("Average time each day: NaN hour(s) and NaN minute(s).")) { //if button was clicked on a page other than results, do this
                monthlyText.textContent = "Please ensure you are on the progress page in order to view monthly stats.";
            } else { //if not, give the stats
                monthlyText.textContent = message.monthlyStats;
            };
        };
    }
);