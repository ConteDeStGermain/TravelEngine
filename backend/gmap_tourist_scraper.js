const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '@Builder',
  port: 5432,
});

// You can also use puppeteer core, know more about it here https://developers.google.com/web/tools/puppeteer/get-started#puppeteer-core
const puppeteer = require('puppeteer');

const getBrowser = () => puppeteer.launch({ headless: false })

// These are class names of some of the specific elements in these cards
const SELECTORS = {
  NAME: '.qBF1Pd.fontHeadlineSmall',
  LISTING: '.hfpxzc',
  RATINGS: '.ZkP5Je',
  PRICE: '.wcldff.fontHeadlineSmall.Cbys4b',
  LINK: '.hfpxzc',
  IMAGE: '.FQ2IWe.p0Hhde',
  NAV_BUTTONS: '.TQbB2b',
  ADDITIONAL_DATA: '.Io6YTe'
}

// Scrapes the data from the page
const getData = async (page, currentPageNum) => {
  return await page.evaluate(async (opts) => {
    const { selectors: SELECTORS } = opts;  
    const elements = document.querySelectorAll(SELECTORS.LISTING);
    const placesElements = Array.from(elements).map(element => element.parentElement);
    let places = []
    for (let i = 0; i < placesElements.length; i++) {
      const name = (placesElements[i].querySelector(SELECTORS.NAME)?.textContent || '').trim();
      const price = (placesElements[i].querySelector(SELECTORS.PRICE)?.textContent || '').trim();
      const link = (placesElements[i].querySelector(SELECTORS.LINK)?.href || '');
      const image = (placesElements[i].querySelector(SELECTORS.IMAGE)?.children[0].src || '');
      const rt = (placesElements[i].querySelector(SELECTORS.RATINGS)?.textContent || '').trim();
      const openingParenIndex = rt.indexOf('(');
      const closingParenIndex = rt.indexOf(')');

      // Extract the first number from the input string
      const rating = parseFloat(rt.substring(0, openingParenIndex));

      // Extract the second number from the input string
      let numberOfRatings = rt.substring(openingParenIndex + 1 , closingParenIndex);
      numberOfRatings = parseInt(numberOfRatings.replace(",", ""));
      places.push({ name, rating, numberOfRatings, price, link, image})
    }

    return places;
  }, { selectors: SELECTORS, currentPageNum });
}

// Scrolls gmap sidebar
const scrollPage = async(page, scrollContainer, itemTargetCount) => {
  let items = [];
  let previousHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
  let cnt = 0
  while (itemTargetCount > cnt) {
    await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
    await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight > ${previousHeight}`);
    await page.waitForTimeout(2000);
    cnt++;
  }

  items = await getData(page);
  return items;
}

async function saveData(city, country, type, jsonString) {
  city = city.toLowerCase();
  country = country.toLowerCase();

  let category = {
    1: "tourist_attraction",
    2: "breakfast",
    3: "dinner",
    4: "cocktail",
    5: "club"
  };

  let categoryType = category[type] || "";
  let placesData = JSON.parse(jsonString);

  for (let i = 0; i < placesData.length; i++) {
    try {
      await pool.query(
        `INSERT INTO place (city, country, type, name, address, rating, numberofratings, price, link, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          city,
          country,
          categoryType,
          placesData[i].name,
          placesData[i].address,
          placesData[i].rating,
          placesData[i].numberOfRatings,
          placesData[i].price || 0,
          placesData[i].link,
          placesData[i].image,
        ]
      );
      console.log('Data inserted successfully!');
    } catch (err) {
      console.error(err);
    }
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeData(city, country, type) {
  let browser = null;
  
  const searchInputs = {
    1: "Tourist attractions",
    2: "breakfast coffee shops breakfast foods",
    3: "dinner restaurants",
    4: "late night snack cocktail lounge",
    5: "night club"
  };
  let searchInput = searchInputs[type] || "";
  
  console.log(`Now scraping ${searchInput} for ${city} ${country}...`);
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    // Connect to remote endpoint
    // Reset the viewport for more results in single page of google maps.
    await page.setViewport({ width: 1440, height: 789 })

    // Visit maps.google.com
    await page.goto('https://maps.google.com')

    // Wait till the page loads and an input field with id searchboxinput is present
    await page.waitForSelector('#searchboxinput')
    // Simulate user click
    await page.click('#searchboxinput')

    // Type our search query
    await page.type('#searchboxinput', `${searchInput}, ${city}, ${country}`);
    // Simulate pressing Enter key
    await page.keyboard.press('Enter');

    // Wait for the page to load results.
    await page.waitForSelector(SELECTORS.LISTING);

    // Get our final structured data
    let finalData =  await scrollPage(page,".m6QErb[aria-label]", 25)
    console.log("Finished scrolling...");

    for (let i = 0; i < finalData.length; i++) {
      const link = await page.$(`a[href="${finalData[i].link}"]`);
      await link.click();
      await delay(2000);
      await page.waitForSelector('div[aria-label^="Information for"]');
    
      // Get the button with an aria-label that starts with "Address:"
      const addressButton = await page.$('button[aria-label^="Address:"]');
    
      if (addressButton) {
        let addressLabel = undefined;
        // Extract the address from the aria-label attribute
        addressLabel = await addressButton.evaluate(el => el.getAttribute('aria-label'));
        let regex = /^Address:\s*(.+)$/i;
        match = addressLabel.match(regex);
    
        let address = '';
        address = match[1].trim();
        finalData[i]["address"] = address;
      }
    }

    console.log('Finished finding addresses');
    const jsonString = JSON.stringify(finalData);

    // Save data to database
    await saveData(city, country, type, jsonString);

    await browser.close();
    // return finalData;
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  scrapeData,
};