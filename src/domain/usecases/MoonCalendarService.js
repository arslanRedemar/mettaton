const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

/**
 * Moon Calendar Service - Use case for crawling and caching moon phase calendars
 *
 * Fetches monthly moon phase calendar images from external website using Puppeteer.
 * Implements monthly caching to prevent redundant crawling.
 *
 * @class MoonCalendarService
 */
class MoonCalendarService {
  /**
   * Creates an instance of MoonCalendarService
   *
   * @param {string} calendarDir - Directory path for storing cached calendar images
   */
  constructor(calendarDir) {
    this.calendarDir = calendarDir;
    if (!fs.existsSync(calendarDir)) {
      fs.mkdirSync(calendarDir, { recursive: true });
      console.log(`[moon-calendar/init] Calendar directory created: ${calendarDir}`);
    }
  }

  /**
   * Gets moon calendar image for current month
   * Returns cached image if available, otherwise crawls the website
   *
   * @returns {Promise<Buffer>} PNG image buffer of the moon calendar
   * @throws {Error} When crawling fails or browser operations error
   */
  async getCalendarImage() {
    const today = new Date();
    const filename = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.png`;
    const filePath = path.join(this.calendarDir, filename);

    // Check cache first
    if (fs.existsSync(filePath)) {
      console.log(`[moon-calendar/cache-hit] Using cached calendar: ${filename}`);
      return fs.readFileSync(filePath);
    }

    // Cache miss - crawl website
    console.log(`[moon-calendar/crawl] Starting crawl for ${filename}`);
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });

      console.log('[moon-calendar/crawl] Navigating to Rhythm of Nature website');
      await page.goto('https://kr.rhythmofnature.net/dal-uiwisang', { waitUntil: 'networkidle2' });

      const calendarSelector = '#moon-calendar';
      const calendar = await page.$(calendarSelector);

      let buffer;
      if (calendar) {
        console.log('[moon-calendar/crawl] Calendar element found, taking element screenshot');
        buffer = await calendar.screenshot({ type: 'png' });
      } else {
        console.log('[moon-calendar/crawl] Calendar element not found, taking full page screenshot');
        buffer = await page.screenshot({ fullPage: true, type: 'png' });
      }

      await browser.close();

      fs.writeFileSync(filePath, buffer);
      console.log(`[moon-calendar/crawl] Calendar saved successfully: ${filename}`);

      return buffer;
    } catch (error) {
      console.error(`[moon-calendar/crawl] ${error.constructor.name}: Failed to crawl calendar:`, error);

      // Ensure browser is closed even on error
      if (browser) {
        try {
          await browser.close();
          console.log('[moon-calendar/crawl] Browser closed after error');
        } catch (closeError) {
          console.error(`[moon-calendar/crawl] ${closeError.constructor.name}: Failed to close browser:`, closeError);
        }
      }
      throw error;
    }
  }
}

module.exports = MoonCalendarService;
