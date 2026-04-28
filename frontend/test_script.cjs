const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3002/');
  
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'staff@hospital.local');
  await page.type('input[type="password"]', 'abc@123');
  await page.click('button[type="submit"]');
  
  await page.waitForSelector('tbody');
  await new Promise(r => setTimeout(r, 2000));
  
  const bbox = await page.$eval('tbody', el => JSON.stringify(el.getBoundingClientRect()));
  const html = await page.$eval('table', el => el.outerHTML);
  const styles = await page.$eval('tbody tr', el => {
    const s = getComputedStyle(el);
    return JSON.stringify({ display: s.display, height: s.height, visibility: s.visibility, opacity: s.opacity });
  });
  
  console.log('TBODY BBOX:', bbox);
  console.log('TR STYLES:', styles);
  console.log('TABLE HTML:', html);
  
  await browser.close();
})();
