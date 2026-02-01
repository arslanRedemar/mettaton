const puppeteer = require('puppeteer-core');

/**
 * PersonalPracticeGraphRenderer
 * Renders calendar stamp + progress bar visualization for personal practice progress using Puppeteer
 */
class PersonalPracticeGraphRenderer {
  /**
   * Render a calendar stamp grid with progress bar for practice progress
   * @param {Object} params
   * @param {string} params.content - Practice content description
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string[]} params.checkDates - Array of completed dates (YYYY-MM-DD)
   * @param {string[]} params.allDates - Array of all dates in range (YYYY-MM-DD)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  async renderGraph({ content, startDate, endDate, checkDates, allDates }) {
    const today = new Date().toISOString().split('T')[0];
    const checkSet = new Set(checkDates);
    const monthGroups = this._groupDatesByMonth(allDates, startDate, endDate);

    // Determine rendering mode based on month count
    const monthCount = monthGroups.length;
    let html;
    let height;

    if (monthCount >= 7) {
      // Mode B: GitHub-style heatmap for plans >= 7 months
      height = 200;
      html = this._generateHeatmapHTML({
        content,
        startDate,
        endDate,
        allDates,
        checkSet,
        today,
      });
    } else {
      // Mode A: Calendar stamp for plans < 7 months
      const monthRows = Math.ceil(monthGroups.length / 2);
      height = 55 + monthRows * 270 + 40;
      html = this._generateHTML({
        content,
        startDate,
        endDate,
        allDates,
        checkSet,
        today,
        monthGroups,
        height,
      });
    }

    let browser = null;
    try {
      // Launch headless browser
      console.log(`[personal-practice/graph] Launching Puppeteer for "${content}" (${startDate}~${endDate})`);
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
      await page.setViewport({ width: 800, height });
      await page.setContent(html);

      // Wait for calendar to render
      await page.waitForSelector('#calendar', { timeout: 5000 });
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 500)));

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 800,
          height,
        },
      });

      console.log(`[personal-practice/graph] Graph rendered successfully for "${content}" (${checkDates.length}/${allDates.length} days completed)`);
      return screenshot;
    } catch (error) {
      console.error(`[personal-practice/graph] ${error.constructor.name}: Failed to render graph for "${content}":`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML with calendar stamp grid and progress bar for rendering
   * @private
   */
  _generateHTML({ content, startDate, endDate, allDates, checkSet, today, monthGroups, height }) {
    // Calculate progress stats
    const completedCount = allDates.filter((date) => checkSet.has(date)).length;
    const totalDays = allDates.length;
    const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    // Generate calendar HTML for each month
    const calendarsHTML = monthGroups.map((month) => {
      const calendarCells = this._generateCalendarCells(month, checkSet, today);
      return `
        <div class="month-calendar">
          <div class="month-header">${month.year}년 ${month.month}월</div>
          <div class="calendar-grid">
            <div class="day-header">일</div>
            <div class="day-header">월</div>
            <div class="day-header">화</div>
            <div class="day-header">수</div>
            <div class="day-header">목</div>
            <div class="day-header">금</div>
            <div class="day-header">토</div>
            ${calendarCells}
          </div>
        </div>
      `;
    }).join('');

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
      width: 800px;
      height: ${height}px;
      background: white;
      font-family: 'Segoe UI', 'Malgun Gothic', Arial, sans-serif;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      text-align: center;
      color: #333;
    }
    .content-wrapper {
      flex: 1;
      display: flex;
      gap: 20px;
    }
    .calendar-container {
      flex: 1;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 15px;
    }
    .month-calendar {
      width: calc(50% - 8px);
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      background: #fafafa;
    }
    .month-header {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      text-align: center;
      color: #555;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .day-header {
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      padding: 4px;
      color: #666;
      background: #e8e8e8;
      border-radius: 4px;
    }
    .day-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      border-radius: 4px;
      position: relative;
    }
    .day-cell.empty {
      background: transparent;
    }
    .day-cell.incomplete {
      background: #E0E0E0;
      color: #999;
    }
    .day-cell.completed {
      background: #4CAF50;
      color: white;
      font-weight: bold;
    }
    .day-cell.completed::after {
      content: '✅';
      position: absolute;
      font-size: 14px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .day-cell.today {
      border: 3px solid #2196F3;
      box-shadow: 0 0 6px rgba(33, 150, 243, 0.5);
    }
    .day-cell .date-num {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 9px;
      opacity: 0.7;
    }
    .progress-container {
      width: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    }
    .progress-title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #555;
    }
    .progress-bar-vertical {
      width: 60px;
      flex: 1;
      background: #E0E0E0;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .progress-fill {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: linear-gradient(to top, #4CAF50, #66BB6A);
      transition: height 0.3s ease;
      height: ${percentage}%;
    }
    .progress-label {
      font-size: 12px;
      text-align: center;
      color: #333;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .progress-detail {
      font-size: 11px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="calendar">
    <div class="title">${content} (${startDate} ~ ${endDate})</div>
    <div class="content-wrapper">
      <div class="calendar-container">
        ${calendarsHTML}
      </div>
      <div class="progress-container">
        <div class="progress-title">달성률</div>
        <div class="progress-bar-vertical">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-label">${percentage}%</div>
        <div class="progress-detail">${completedCount}/${totalDays}일</div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Group dates by month for calendar layout
   * @private
   */
  _groupDatesByMonth(allDates, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];

    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;

      // Get first day of month (0 = Sunday, 6 = Saturday)
      const firstDay = new Date(year, month - 1, 1).getDay();

      // Get last date of month
      const lastDate = new Date(year, month, 0).getDate();

      months.push({
        year,
        month,
        firstDay,
        lastDate,
        dates: allDates.filter((date) => {
          const d = new Date(date);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }),
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  /**
   * Generate calendar cells HTML for a month
   * @private
   */
  _generateCalendarCells(month, checkSet, today) {
    const cells = [];
    const planDates = new Set(month.dates);

    // Add empty cells for days before first day of month
    for (let i = 0; i < month.firstDay; i++) {
      cells.push('<div class="day-cell empty"></div>');
    }

    // Add cells for each day of the month
    for (let day = 1; day <= month.lastDate; day++) {
      const dateStr = `${month.year}-${String(month.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (!planDates.has(dateStr)) {
        // Date outside plan range
        cells.push('<div class="day-cell empty"></div>');
      } else {
        const isCompleted = checkSet.has(dateStr);
        const isToday = dateStr === today;
        const classes = ['day-cell'];

        if (isCompleted) classes.push('completed');
        else classes.push('incomplete');

        if (isToday) classes.push('today');

        cells.push(`<div class="${classes.join(' ')}"><span class="date-num">${day}</span></div>`);
      }
    }

    return cells.join('');
  }

  /**
   * Generate HTML with GitHub-style heatmap for long-term plans (>= 7 months)
   * @private
   */
  _generateHeatmapHTML({ content, startDate, endDate, allDates, checkSet, today }) {
    // Calculate progress stats
    const completedCount = allDates.filter((date) => checkSet.has(date)).length;
    const totalDays = allDates.length;
    const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    // Organize dates into weeks (each week = column)
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find the Sunday of the week containing startDate
    const firstSunday = new Date(start);
    firstSunday.setDate(start.getDate() - start.getDay());

    // Find the Saturday of the week containing endDate
    const lastSaturday = new Date(end);
    lastSaturday.setDate(end.getDate() + (6 - end.getDay()));

    // Build week grid
    const weeks = [];
    let currentWeekStart = new Date(firstSunday);

    while (currentWeekStart <= lastSaturday) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(currentWeekStart);
        currentDate.setDate(currentWeekStart.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        week.push(dateStr);
      }
      weeks.push(week);
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Generate month labels
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = new Date(week[0]);
      const month = firstDayOfWeek.getMonth();

      if (month !== lastMonth) {
        monthLabels.push({
          weekIndex,
          label: `${month + 1}월`,
        });
        lastMonth = month;
      }
    });

    // Generate heatmap cells
    const heatmapCells = weeks.map((week) => {
      return week.map((dateStr) => {
        const date = new Date(dateStr);
        const inRange = allDates.includes(dateStr);
        const isCompleted = checkSet.has(dateStr);
        const isToday = dateStr === today;

        let cellClass = 'heatmap-cell';
        if (!inRange) {
          cellClass += ' out-of-range';
        } else if (isCompleted) {
          cellClass += ' completed';
        } else {
          cellClass += ' incomplete';
        }

        if (isToday) {
          cellClass += ' today';
        }

        return `<div class="${cellClass}"></div>`;
      }).join('');
    }).join('');

    // Generate month label positions
    const monthLabelsHTML = monthLabels.map(({ weekIndex, label }) => {
      const leftPos = 50 + weekIndex * 13; // 50px left margin + weekIndex * (11px cell + 2px gap)
      return `<div class="month-label" style="left: ${leftPos}px">${label}</div>`;
    }).join('');

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
      width: 800px;
      height: 200px;
      background: white;
      font-family: 'Segoe UI', 'Malgun Gothic', Arial, sans-serif;
      padding: 15px;
      display: flex;
      flex-direction: column;
    }
    .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
      color: #333;
    }
    .content-wrapper {
      flex: 1;
      display: flex;
      gap: 15px;
    }
    .heatmap-container {
      flex: 1;
      position: relative;
      padding-top: 20px;
      padding-left: 50px;
    }
    .month-labels {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 20px;
    }
    .month-label {
      position: absolute;
      font-size: 10px;
      color: #666;
      font-weight: bold;
    }
    .day-labels {
      position: absolute;
      left: 0;
      top: 20px;
      width: 50px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .day-label {
      height: 11px;
      font-size: 9px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 5px;
    }
    .day-label.empty {
      visibility: hidden;
    }
    .heatmap-grid {
      display: grid;
      grid-template-rows: repeat(7, 11px);
      grid-auto-flow: column;
      grid-auto-columns: 11px;
      gap: 2px;
    }
    .heatmap-cell {
      width: 11px;
      height: 11px;
      border-radius: 2px;
    }
    .heatmap-cell.out-of-range {
      background: transparent;
    }
    .heatmap-cell.incomplete {
      background: #EBEDF0;
    }
    .heatmap-cell.completed {
      background: #4CAF50;
    }
    .heatmap-cell.today {
      border: 2px solid #2196F3;
      box-shadow: 0 0 4px rgba(33, 150, 243, 0.5);
    }
    .progress-container {
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    }
    .progress-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #555;
    }
    .progress-bar-vertical {
      width: 50px;
      flex: 1;
      background: #E0E0E0;
      border-radius: 6px;
      position: relative;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .progress-fill {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: linear-gradient(to top, #4CAF50, #66BB6A);
      transition: height 0.3s ease;
      height: ${percentage}%;
    }
    .progress-label {
      font-size: 11px;
      text-align: center;
      color: #333;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .progress-detail {
      font-size: 10px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="calendar">
    <div class="title">${content} (${startDate} ~ ${endDate})</div>
    <div class="content-wrapper">
      <div class="heatmap-container">
        <div class="month-labels">
          ${monthLabelsHTML}
        </div>
        <div class="day-labels">
          <div class="day-label empty"></div>
          <div class="day-label">월</div>
          <div class="day-label empty"></div>
          <div class="day-label">수</div>
          <div class="day-label empty"></div>
          <div class="day-label">금</div>
          <div class="day-label empty"></div>
        </div>
        <div class="heatmap-grid">
          ${heatmapCells}
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-title">달성률</div>
        <div class="progress-bar-vertical">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-label">${percentage}%</div>
        <div class="progress-detail">${completedCount}/${totalDays}일</div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

module.exports = PersonalPracticeGraphRenderer;
