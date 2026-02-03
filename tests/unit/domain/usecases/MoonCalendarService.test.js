const MoonCalendarService = require('../../../../src/domain/usecases/MoonCalendarService');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

jest.mock('fs');
jest.mock('puppeteer-core');

describe('MoonCalendarService', () => {
  let service;
  let mockCalendarDir;
  let mockBrowser;
  let mockPage;
  let originalEnv;

  beforeEach(() => {
    mockCalendarDir = '/test/calendar/dir';
    originalEnv = process.env.CHROMIUM_PATH;

    // Mock fs methods
    fs.existsSync = jest.fn();
    fs.mkdirSync = jest.fn();
    fs.readFileSync = jest.fn();
    fs.writeFileSync = jest.fn();

    // Mock puppeteer browser and page
    mockPage = {
      setViewport: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      $: jest.fn(),
      screenshot: jest.fn(),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    puppeteer.launch = jest.fn().mockResolvedValue(mockBrowser);

    // Mock console methods to suppress logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.CHROMIUM_PATH = originalEnv;
  });

  describe('constructor', () => {
    it('should create calendar directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      service = new MoonCalendarService(mockCalendarDir);

      expect(fs.existsSync).toHaveBeenCalledWith(mockCalendarDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockCalendarDir, { recursive: true });
      expect(service.calendarDir).toBe(mockCalendarDir);
    });

    it('should not create calendar directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);

      service = new MoonCalendarService(mockCalendarDir);

      expect(fs.existsSync).toHaveBeenCalledWith(mockCalendarDir);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(service.calendarDir).toBe(mockCalendarDir);
    });
  });

  describe('getCalendarImage', () => {
    beforeEach(() => {
      // Reset fs mocks before each test
      fs.existsSync.mockReset();
      fs.readFileSync.mockReset();
      fs.writeFileSync.mockReset();

      // Constructor needs directory to exist
      fs.existsSync.mockReturnValueOnce(true);
      service = new MoonCalendarService(mockCalendarDir);
    });

    it('should return cached image if it exists', async () => {
      const mockBuffer = Buffer.from('cached-image-data');
      const today = new Date();
      const expectedFilename = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.png`;
      const expectedFilePath = path.join(mockCalendarDir, expectedFilename);

      // Cache file exists
      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockReturnValue(mockBuffer);

      const result = await service.getCalendarImage();

      expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath);
      expect(result).toBe(mockBuffer);
      expect(puppeteer.launch).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[moon-calendar/cache-hit]')
      );
    });

    it('should crawl website and cache image when cache does not exist', async () => {
      const mockImageBuffer = Buffer.from('crawled-image-data');
      const mockElement = {
        screenshot: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      // Ensure CHROMIUM_PATH is set to expected default
      delete process.env.CHROMIUM_PATH;

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.$.mockResolvedValue(mockElement);

      const result = await service.getCalendarImage();

      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.setViewport).toHaveBeenCalledWith({ width: 1200, height: 800 });
      expect(mockPage.goto).toHaveBeenCalledWith(
        'https://kr.rhythmofnature.net/dal-uiwisang',
        { waitUntil: 'networkidle2' }
      );
      expect(mockPage.$).toHaveBeenCalledWith('#moon-calendar');
      expect(mockElement.screenshot).toHaveBeenCalledWith({ type: 'png' });
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(result).toBe(mockImageBuffer);
    });

    it('should use CHROMIUM_PATH environment variable if set', async () => {
      const customPath = '/custom/chromium/path';
      process.env.CHROMIUM_PATH = customPath;

      const mockImageBuffer = Buffer.from('image-data');
      const mockElement = {
        screenshot: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.$.mockResolvedValue(mockElement);

      await service.getCalendarImage();

      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        executablePath: customPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    });

    it('should take full page screenshot when calendar element is not found', async () => {
      const mockImageBuffer = Buffer.from('fullpage-image-data');

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.$.mockResolvedValue(null); // element not found
      mockPage.screenshot.mockResolvedValue(mockImageBuffer);

      const result = await service.getCalendarImage();

      expect(mockPage.$).toHaveBeenCalledWith('#moon-calendar');
      expect(mockPage.screenshot).toHaveBeenCalledWith({ fullPage: true, type: 'png' });
      expect(result).toBe(mockImageBuffer);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Calendar element not found, taking full page screenshot')
      );
    });

    it('should close browser and rethrow error on crawl failure', async () => {
      const crawlError = new Error('Network timeout');

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.goto.mockRejectedValue(crawlError);

      await expect(service.getCalendarImage()).rejects.toThrow('Network timeout');

      expect(mockBrowser.close).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[moon-calendar\/crawl\].*Failed to crawl calendar/),
        crawlError
      );
    });

    it('should handle browser close error gracefully', async () => {
      const crawlError = new Error('Page crash');
      const closeError = new Error('Browser already closed');

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.$.mockRejectedValue(crawlError);
      mockBrowser.close.mockRejectedValue(closeError);

      await expect(service.getCalendarImage()).rejects.toThrow('Page crash');

      expect(mockBrowser.close).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to close browser'),
        closeError
      );
    });

    it('should generate correct filename for current month', async () => {
      const mockImageBuffer = Buffer.from('image-data');
      const mockElement = {
        screenshot: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      // Mock specific date
      const mockDate = new Date('2026-02-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Cache file does not exist
      fs.existsSync.mockReturnValueOnce(false);
      mockPage.$.mockResolvedValue(mockElement);

      await service.getCalendarImage();

      const expectedFilename = '2026-02.png';
      const expectedFilePath = path.join(mockCalendarDir, expectedFilename);

      expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
      expect(fs.writeFileSync).toHaveBeenCalledWith(expectedFilePath, mockImageBuffer);

      global.Date.mockRestore();
    });
  });
});
