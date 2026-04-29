const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log('FAILED RESPONSE:', response.url(), response.status());
    }
  });
  
  await page.goto('https://langyizhao.github.io/The-First-Mission-of-Agent-P/');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const evalData = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'No canvas';
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, 100, 100).data;
    return Array.from(data.slice(0, 16));
  });
  console.log('EVAL:', evalData);
  
  // also inject a check for image naturalWidth
  const imgData = await page.evaluate(async () => {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // maybe this?
        img.onload = () => resolve('loaded: ' + img.width);
        img.onerror = () => resolve('error');
        img.src = '/The-First-Mission-of-Agent-P/assets/Environment-XNGqs4iG.jpeg';
    });
  });
  console.log('IMG:', imgData);

  await browser.close();
})();
