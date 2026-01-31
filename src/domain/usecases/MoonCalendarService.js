const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

/**
 * 달 위상 달력 서비스 유스케이스
 */
class MoonCalendarService {
  constructor(calendarDir) {
    this.calendarDir = calendarDir;
    if (!fs.existsSync(calendarDir)) {
      fs.mkdirSync(calendarDir, { recursive: true });
    }
  }

  async getCalendarImage() {
    const today = new Date();
    const filename = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.png`;
    const filePath = path.join(this.calendarDir, filename);

    if (fs.existsSync(filePath)) {
      console.log(`[MoonCalendarService] Using cached calendar: ${filename}`);
      return fs.readFileSync(filePath);
    }

    console.log('[MoonCalendarService] Crawling moon calendar...');
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto('https://kr.rhythmofnature.net/dal-uiwisang', { waitUntil: 'networkidle2' });

      const calendarSelector = '#moon-calendar';
      const calendar = await page.$(calendarSelector);

      let buffer;
      if (calendar) {
        buffer = await calendar.screenshot({ type: 'png' });
      } else {
        console.log('[MoonCalendarService] Calendar element not found, taking full page screenshot');
        buffer = await page.screenshot({ fullPage: true, type: 'png' });
      }

      await browser.close();

      fs.writeFileSync(filePath, buffer);
      console.log(`[MoonCalendarService] Calendar saved successfully: ${filename}`);

      return buffer;
    } catch (error) {
      console.error(`[MoonCalendarService] Failed to crawl calendar:`, error);
      if (browser) {
        try { await browser.close(); } catch { /* ignore close errors */ }
      }
      throw error;
    }
  }
}

module.exports = MoonCalendarService;
