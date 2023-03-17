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
}

// Scrapes the data from the page
const getData = async (page, currentPageNum) => {
  return await page.evaluate((opts) => {
    const { selectors: SELECTORS } = opts;

    const elements = document.querySelectorAll(SELECTORS.LISTING);
    const placesElements = Array.from(elements).map(element => element.parentElement);

    const places = placesElements.map((place, index) => {
      // Getting the names
      const name = (place.querySelector(SELECTORS.NAME)?.textContent || '').trim();
      const rating = (place.querySelector(SELECTORS.RATINGS)?.textContent || '').trim();
      const price = (place.querySelector(SELECTORS.PRICE)?.textContent || '').trim();
      const link = (place.querySelector(SELECTORS.LINK)?.href || '');
      const image = (place.querySelector(SELECTORS.IMAGE)?.children[0].src || '');

      return { name, rating, price, link, image };
    })

    return places;
  }, { selectors: SELECTORS, currentPageNum });
}


const scrollPage = async(page, scrollContainer, itemTargetCount) => {
  let items = [];
  let previousHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
  while (itemTargetCount > items.length) {
      items = await getData(page);
      await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
      await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(2000);
  }
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
    await page.type('#searchboxinput', "Tourist attractions, Barcelona, Spain");
    // Simulate pressing Enter key
    await page.keyboard.press('Enter');

    // Wait for the page to load results.
    await page.waitForSelector(SELECTORS.LISTING);

    // Get our final structured data
    let finalData =  await scrollPage(page,".m6QErb[aria-label]", 50)


    console.log(finalData, finalData.length);

    browser.close();
    return finalData;

  } catch (error) {
    console.log(error)
  }

})();