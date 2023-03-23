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
      const rating = (placesElements[i].querySelector(SELECTORS.RATINGS)?.textContent || '').trim();
      const price = (placesElements[i].querySelector(SELECTORS.PRICE)?.textContent || '').trim();
      const link = (placesElements[i].querySelector(SELECTORS.LINK)?.href || '');
      const image = (placesElements[i].querySelector(SELECTORS.IMAGE)?.children[0].src || '');
      places.push({ name, rating, price, link, image})
    }

    return places;
  }, { selectors: SELECTORS, currentPageNum });
}


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

(async () => {
  let browser = null;
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
    await page.type('#searchboxinput', "Tourist attractions, Rome, Italy");
    // Simulate pressing Enter key
    await page.keyboard.press('Enter');

    // Wait for the page to load results.
    await page.waitForSelector(SELECTORS.LISTING);

    // Get our final structured data
    let finalData =  await scrollPage(page,".m6QErb[aria-label]", 15)

    for (let i = 0; i < finalData.length; i++){
      const link = await page.$(`a[href="${finalData[i].link}"]`);
      await link.click();
      await page.waitForSelector('div[aria-label^="Information for"]');
      const card = await page.$('div[aria-label^="Information for"]');
      let cardChildren = undefined;
      const regex = /"Address: (.+?)"/;
      if (card != null) {
        cardChildren = await card.$$eval('*', elements => elements.map(el => el.outerHTML));
        match = cardChildren[2].match(regex);
        let subString = match[0].substring("Address: ".length);
        subString = subString.trim(); // Remove starting and ending white spaces
        subString = subString.substring(0, subString.length - 2);
        finalData[i]["address"] = subString
      }
    }

    console.log(finalData, finalData.length);

    await 

    browser.close();
    // return finalData;

  } catch (error) {
    console.log(error)
  }

})();