require('dotenv').config();
const path = require('path');

module.exports = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  greetingChannelId: process.env.GREETING_CHANNEL_ID,
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '../../data/mettaton.db'),
  },
  calendarDir: 'moon_calendars',
  channels: {
    schedule: process.env.SCHEDULE_CHANNEL_ID,
    question: process.env.QUESTION_CHANNEL_ID,
    practice: process.env.PRACTICE_CHANNEL_ID,
  },
};
