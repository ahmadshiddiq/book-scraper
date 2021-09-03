const scraperObject = {
  url: "http://books.toscrape.com",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to this ${this.url}...`);
    await page.goto(this.url);
    // wait for target DOm to be rendered
    await page.waitForSelector(".page_inner");
    // get the link to all the required book
    let urls = await page.$$eval("section ol > li", (links) => {
      // make sure books to be scraped is in stock
      links = links.filter(
        (link) =>
          link.querySelector(".instock.availability").textContent !== "In stock"
      );
      // extract the link from data
      links = links.map((el) => el.querySelector("h3 > a").href);
      return links;
    });

    console.log(urls);
  },
};

module.exports = scraperObject;
