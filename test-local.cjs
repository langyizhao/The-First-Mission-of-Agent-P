const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const evalData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'No canvas';
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, 100, 100).data;
    // return subset to see if it's drawn
    return Array.from(data.slice(0, 16));
  });
  console.log('EVAL:', evalData);
  
  await browser.close();
})();
