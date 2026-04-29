const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() >= 400) {
        console.log('404 URL:', response.url());
    }
  });
  
  await page.goto('https://langyizhao.github.io/The-First-Mission-of-Agent-P/', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
