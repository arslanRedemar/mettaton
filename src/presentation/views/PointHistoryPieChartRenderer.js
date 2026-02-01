const puppeteer = require('puppeteer-core');

/**
 * Activity type display configuration
 */
const ACTIVITY_TYPES = {
  FORUM_POST: {
    label: '포럼 글쓰기',
    color: '#4CAF50',
  },
  QUESTION_ANSWER: {
    label: '질문 답변',
    color: '#2196F3',
  },
  MEETING_ATTEND: {
    label: '수행모임 참여',
    color: '#FF9800',
  },
  PERSONAL_PRACTICE: {
    label: '개인수행',
    color: '#9C27B0',
  },
  GENERAL: {
    label: '일반활동',
    color: '#607D8B',
  },
  QUIZ_PARTICIPATE: {
    label: '퀴즈 참가',
    color: '#E91E63',
  },
  QUIZ_CORRECT: {
    label: '퀴즈 정답',
    color: '#F44336',
  },
};

/**
 * PointHistoryPieChartRenderer
 * Renders pie chart visualization for point award history using Puppeteer
 */
class PointHistoryPieChartRenderer {
  /**
   * Render a pie chart for point award history
   * @param {Object} params
   * @param {string} params.userName - User display name
   * @param {Array<{activityType: string, totalPoints: number}>} params.history - Point history data
   * @param {string} [params.startDate] - Start date (YYYY-MM-DD), optional
   * @param {string} [params.endDate] - End date (YYYY-MM-DD), optional
   * @returns {Promise<Buffer>} PNG image buffer
   */
  async renderPieChart({ userName, history, startDate, endDate }) {
    if (!history || history.length === 0) {
      throw new Error('No history data to render');
    }

    // Calculate total and percentages
    const totalPoints = history.reduce((sum, item) => sum + item.totalPoints, 0);
    const chartData = history.map((item) => {
      const config = ACTIVITY_TYPES[item.activityType] || {
        label: item.activityType,
        color: '#999999',
      };
      return {
        activityType: item.activityType,
        label: config.label,
        color: config.color,
        points: item.totalPoints,
        percentage: Math.round((item.totalPoints / totalPoints) * 100),
      };
    });

    const html = this._generateHTML({
      userName,
      chartData,
      totalPoints,
      startDate,
      endDate,
    });

    let browser = null;
    try {
      console.log(`[point/history] Launching Puppeteer for user "${userName}"`);
      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 600, height: 400 });
      await page.setContent(html);

      // Wait for chart to render
      await page.waitForSelector('#pie-chart', { timeout: 5000 });
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 500)));

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 600,
          height: 400,
        },
      });

      console.log(`[point/history] Pie chart rendered successfully for "${userName}" (${totalPoints}P total)`);
      return screenshot;
    } catch (error) {
      console.error(`[point/history] ${error.constructor.name}: Failed to render pie chart for "${userName}":`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML with CSS pie chart for rendering
   * @private
   */
  _generateHTML({ userName, chartData, totalPoints, startDate, endDate }) {
    // Generate conic-gradient stops
    let currentPercentage = 0;
    const gradientStops = chartData.map((item) => {
      const start = currentPercentage;
      const end = currentPercentage + item.percentage;
      currentPercentage = end;
      return `${item.color} ${start}% ${end}%`;
    }).join(', ');

    // Generate legend items
    const legendItems = chartData.map((item) => `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${item.color};"></div>
        <div class="legend-text">
          <div class="legend-label">${item.label}</div>
          <div class="legend-value">${item.points.toLocaleString()}P (${item.percentage}%)</div>
        </div>
      </div>
    `).join('');

    // Generate period text if dates provided
    const periodText = startDate && endDate
      ? `<div class="period">기간: ${startDate} ~ ${endDate}</div>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 600px;
      height: 400px;
      background: white;
      font-family: 'Segoe UI', 'Malgun Gothic', Arial, sans-serif;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
      text-align: center;
      color: #333;
    }
    .period {
      font-size: 12px;
      margin-bottom: 15px;
      text-align: center;
      color: #666;
    }
    .content {
      flex: 1;
      display: flex;
      gap: 30px;
      align-items: center;
      justify-content: center;
    }
    .chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .pie-chart {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: conic-gradient(${gradientStops});
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .total-points {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 250px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .legend-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .legend-label {
      font-size: 13px;
      font-weight: bold;
      color: #333;
    }
    .legend-value {
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="pie-chart">
    <div class="title">📊 ${userName}님의 활동별 포인트 내역</div>
    ${periodText}
    <div class="content">
      <div class="chart-container">
        <div class="pie-chart"></div>
        <div class="total-points">총 ${totalPoints.toLocaleString()}P 적립</div>
      </div>
      <div class="legend">
        ${legendItems}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

module.exports = PointHistoryPieChartRenderer;
