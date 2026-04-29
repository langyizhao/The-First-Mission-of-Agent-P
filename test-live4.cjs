const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('Environment')) {
        console.log('Environment URL:', response.url(), 'STATUS:', response.status());
    }
    if (response.url().includes('player')) {
        console.log('player URL:', response.url(), 'STATUS:', response.status());
    }
  });
  
  await page.goto('https://langyizhao.github.io/The-First-Mission-of-Agent-P/', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
