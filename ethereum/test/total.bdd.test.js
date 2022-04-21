// Start with a webdriver instance:
const selenium_webdriver = 'selenium-webdriver';
const sw = require(selenium_webdriver);
const driver = new sw.Builder()
  .withCapabilities(sw.Capabilities.chrome())
  .build()

// And then...
import { use, expect } from 'chai';
const chai_webdriver = 'chai-webdriver';
const chaiWebdriver = require(chai_webdriver);
use(chaiWebdriver(driver));

// And you're good to go!
driver.get('http://github.com');
expect('#site-container h1.heading').dom.to.not.contain.text("I'm a kitty!");


// npm install           # download the necessary development dependencies
// npm run-script build  # compile coffee-script into javascript
// npm test              # build and run the specs