require('dotenv').config();
const path = require('path');

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  greetingChannelId: process.env.GREETING_CHANEL_ID,
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '../../data/mettaton.db'),
  },
  calendarDir: 'moon_calendars',
  channels: {
    schedule: '🤍-일정',
    question: '💙-질문-연구토론',
    practice: '👁🗨-수행계획방',
  },
};
