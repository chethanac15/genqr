const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  await page.goto('http://127.0.0.1:4173');
  await page.waitForFunction(() => window.__qrReady === true, null, { timeout: 20000 });
  await page.fill('#qr-input', 'https://example.com');
  await page.click('#generate-btn');
  await page.waitForTimeout(2000);
  const status = await page.textContent('#status-message');
  console.log('Status:', status);
  console.log('Errors:', errors);
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  await browser.close();
})();
