const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3002/');
  await page.type('input[type="email"]', 'staff@hospital.local');
  await page.type('input[type="password"]', 'abc@123');
  await page.click('button[type="submit"]');
  await page.waitForSelector('tbody');
  await new Promise(r => setTimeout(r, 2000));
  
  const boxes = await page.evaluate(() => {
    const getBbox = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { y: b.y, height: b.height, top: b.top, bottom: b.bottom };
    };
    return {
      tableOuter: getBbox('.table-outer'),
      tableScroll: getBbox('.table-scroll'),
      table: getBbox('table'),
      thead: getBbox('thead'),
      tbody: getBbox('tbody'),
      tr: getBbox('tbody tr')
    };
  });
  console.log(JSON.stringify(boxes, null, 2));
  await browser.close();
})();
