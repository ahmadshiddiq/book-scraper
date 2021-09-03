const browserObject = require("./browser");
const scraperController = require("./pageController");

// start browser and create browser instance
let browserInstance = browserObject.startBrowser();

// pass the browser instance to the scrapper controller
scraperController(browserInstance);
