const scraperObject = {
  url: "http://books.toscrape.com",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to this ${this.url}...`);
    await page.goto(this.url);
    let scrapedData = [];
    async function scrapedCurrentPage() {
      // wait for target DOM to be rendered
      await page.waitForSelector(".page_inner");
      // get the link to all the required book
      let urls = await page.$$eval("section ol > li", (links) => {
        // make sure books to be scraped is in stock
        links = links.filter(
          (link) =>
            link.querySelector(".instock.availability").textContent !==
            "In stock"
        );
        // extract the link from data
        links = links.map((el) => el.querySelector("h3 > a").href);
        return links;
      });

      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.goto(link);
          dataObj["bookTitle"] = await newPage.$eval(
            ".product_main > h1",
            (text) => text.textContent
          );
          dataObj["bookPrice"] = await newPage.$eval(
            ".price_color",
            (text) => text.textContent
          );
          dataObj["noAvailable"] = await newPage.$eval(
            ".instock.availability",
            (text) => {
              // strip new line and tab spaces
              text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
              // get the number of stock available
              let regexp = /^.*\((.*)\).*$/i;
              let stockAvailable = regexp.exec(text)[1].split(" ")[0];
              return stockAvailable;
            }
          );
          dataObj["imageUrl"] = await newPage.$eval(
            "#product_gallery img",
            (img) => img.src
          );
          dataObj["bookDescription"] = await newPage.$eval(
            "#product_description",
            (div) => div.nextSibling.nextSibling.textContent
          );
          dataObj["upc"] = await newPage.$eval(
            ".table.table-striped > tbody > tr > td",
            (table) => table.textContent
          );
          resolve(dataObj);
          await newPage.close();
        });

      // loop through each of those links, open a new page instance and get relevant data from it
      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
        // console.log(currentPageData);
      }

      // when all data on this page is done, click next button and start scraping the next page
      // you are going to check if button exist first, so you know if there is a really page.
      let nextButtonExist = false;
      try {
        const nextButton = await page.$eval(".next > a", (a) => a.textContent);
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
      }
      if (nextButtonExist) {
        await page.click(".next > a");
        return scrapedCurrentPage(); // call this function recursively
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapedCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
