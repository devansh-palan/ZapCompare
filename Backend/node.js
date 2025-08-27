import puppeteer from "puppeteer";

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  );

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  return { browser, page };
}


export async function scrapeBlinkit(brand, item, limit = 10) {
  const { browser, page } = await launchBrowser();
  const searchUrl = `https://blinkit.com/s/?q=${brand}%20${item}`;
  console.log("Navigating to:", searchUrl);

  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("body");

  await page.waitForFunction(
    (limit) =>
      document.querySelectorAll("div.tw-relative.tw-flex.tw-h-full").length >=
      limit,
    { timeout: 20000 },
    limit
  );

  for (let i = 0; i < limit; i++) {
    await page.evaluate((i) => {
      const card = document.querySelectorAll(
        "div.tw-relative.tw-flex.tw-h-full"
      )[i];
      if (card) card.scrollIntoView();
    }, i);

    await page.waitForFunction(
      (i) => {
        const card = document.querySelectorAll(
          "div.tw-relative.tw-flex.tw-h-full"
        )[i];
        if (!card) return false;
        const img = card.querySelector("img");
        return (
          img &&
          (img.getAttribute("src") ||
            img.getAttribute("srcset") ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-srcset"))
        );
      },
      { timeout: 5000 },
      i
    );
  }

  const products = await page.evaluate((limit) => {
    const items = [];
    const productCards = document.querySelectorAll(
      "div.tw-relative.tw-flex.tw-h-full"
    );

    for (let i = 0; i < limit && i < productCards.length; i++) {
      const card = productCards[i];
      const id = card.getAttribute("id"); 

      const name =
        card.querySelector(".tw-text-300")?.innerText.trim() || "Unknown";
      const price =
        card.querySelector(".tw-text-200.tw-font-semibold")?.innerText.trim() ||
        "N/A";

      const imgEl = card.querySelector("img");
      const image =
        imgEl?.getAttribute("src") ||
        imgEl?.getAttribute("srcset")?.split(" ")[0] ||
        imgEl?.getAttribute("data-src") ||
        imgEl?.getAttribute("data-srcset")?.split(" ")[0] ||
        "";

      let slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") 
        .replace(/\s+/g, "-") 
        .trim();

      const link = id
        ? `https://blinkit.com/prn/${slug}/prid/${id}`
        : "https://blinkit.com";

      items.push({ id, name, price, image, link });
    }
    return items;
  }, limit);

  await browser.close();
  return products;
}


export async function scrapeSwiggyInstamart(brand, item, limit = 10) {
  const { browser, page } = await launchBrowser();
  const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${brand}%20${item}`;
  console.log("Navigating to:", searchUrl);

  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("body");

  await page.waitForFunction(
    (limit) =>
      document.querySelectorAll("[data-testid='default_container_ux4']").length >=
      limit,
    { timeout: 20000 },
    limit
  );

  for (let i = 0; i < limit; i++) {
    await page.evaluate((i) => {
      const card = document.querySelectorAll(
        "[data-testid='default_container_ux4']"
      )[i];
      if (card) card.scrollIntoView();
    }, i);

    await page.waitForFunction(
      (i) => {
        const card = document.querySelectorAll(
          "[data-testid='default_container_ux4']"
        )[i];
        if (!card) return false;

       
        const priceEl = card.querySelector("[data-testid='item-offer-price']");
        const priceValid =
          priceEl &&
          ((priceEl.innerText && priceEl.innerText.trim().length > 0) ||
            (priceEl.getAttribute("aria-label") &&
              priceEl.getAttribute("aria-label").trim().length > 0));

        
        const img = card.querySelector("img");
        const imgValid =
          img &&
          (img.getAttribute("src") ||
            (img.getAttribute("srcset") &&
              img.getAttribute("srcset").trim().length > 0));

        return priceValid && imgValid;
      },
      { timeout: 20000 }, 
      i
    );
  }

  
  const products = await page.evaluate((limit) => {
    const items = [];
    const productCards = document.querySelectorAll(
      "[data-testid='default_container_ux4']"
    );

    for (let i = 0; i < limit && i < productCards.length; i++) {
      const card = productCards[i];

      const name =
        card.querySelector(".novMV")?.innerText.trim() ||
        card.querySelector("._1sPB0")?.innerText.trim() ||
        "Unknown";

      const price =
        card.querySelector("[data-testid='item-offer-price']")?.innerText.trim() ||
        card.querySelector("[data-testid='item-offer-price']")?.getAttribute("aria-label")?.trim() ||
        "N/A";

      const imgEl = card.querySelector("img");
      const image =
        imgEl?.getAttribute("src") ||
        imgEl?.getAttribute("srcset")?.split(" ")[0] ||
        "";

      
      const link =
        card.querySelector("a")?.href || window.location.href;

      items.push({ name, price, image, link });
    }
    return items.slice(0, limit); 
  }, limit);

  await browser.close();
  return products;
}


export async function scrapeZepto(brand, item, limit = 10) {
  const { browser, page } = await launchBrowser();
  const searchUrl = `https://www.zeptonow.com/search?query=${brand}%20${item}`;
  console.log("Navigating to:", searchUrl);

  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

  
  await page.waitForSelector("div[data-slot-id='ProductName']", { timeout: 30000 });

  
  let loaded = 0;
  while (loaded < limit) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await new Promise(r => setTimeout(r, 1500));

    loaded = await page.evaluate(() =>
      document.querySelectorAll("div[data-slot-id='ProductName']").length
    );
  }

  
  const products = await page.evaluate((limit) => {
    const items = [];
    const nameNodes = document.querySelectorAll("div[data-slot-id='ProductName']");

    for (let i = 0; i < limit && i < nameNodes.length; i++) {
      const wrapper = nameNodes[i].closest("div.c5SZXs") || nameNodes[i].closest("div");

      const name = nameNodes[i].querySelector("span")?.innerText.trim() || "Unknown";

      const price =
        wrapper.querySelector("div[data-slot-id='Price'] p")?.innerText.trim() || "N/A";

      const imgEl = wrapper.querySelector("div[data-slot-id='ProductImageWrapper'] img");
      const image =
        imgEl?.getAttribute("src") ||
        imgEl?.getAttribute("srcset")?.split(" ")[0] ||
        "";

      const relativeLink = wrapper.closest("a")?.getAttribute("href") || "";
      const link = relativeLink ? "https://www.zeptonow.com" + relativeLink : "";

      items.push({ name, price, image, link });
    }

    return items;
  }, limit);

  await browser.close();

  
  const uniqueProducts = Array.from(new Map(products.map(p => [p.link, p])).values());

  return uniqueProducts;
}