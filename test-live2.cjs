const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://langyizhao.github.io/The-First-Mission-of-Agent-P/');
  
  const imgError = await page.evaluate(async () => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve('loaded: ' + img.width);
        img.onerror = (e) => {
            // e is an Event
            resolve('error type: ' + e.type + ' url: ' + img.src);
        };
        img.src = '/The-First-Mission-of-Agent-P/assets/Environment-XNGqs4iG.jpeg';
    });
  });
  console.log('IMG RESULT:', imgError);
  
  await browser.close();
})();
