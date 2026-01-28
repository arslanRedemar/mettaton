const { REST, Routes } = require('discord.js');
const path = require('path');

const config = require('./config');
const client = require('./infrastructure/discord/client');
const JsonDataRepository = require('./infrastructure/persistence/JsonDataRepository');
const MoonCalendarService = require('./infrastructure/services/MoonCalendarService');
const SchedulerService = require('./application/services/SchedulerService');
const commands = require('./interfaces/commands');
const events = require('./interfaces/events');

// Initialize dependencies
const repository = new JsonDataRepository(config.dataFile);
const moonCalendarService = new MoonCalendarService(path.join(__dirname, '..', config.calendarDir));

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    console.log('⌛ 슬래시 명령어 등록 중...');
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands.map((cmd) => cmd.data.toJSON()),
    });
    console.log('✅ 슬래시 명령어 등록 완료');
  } catch (err) {
    console.error('슬래시 명령어 등록 실패:', err);
  }
}

// Register event handlers
function registerEvents() {
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => {
        if (event.name === 'interactionCreate') {
          event.execute(...args, repository);
        } else if (event.name === 'messageCreate') {
          event.execute(...args, { moonCalendarService });
        } else if (event.name === 'messageDelete') {
          event.execute(...args, repository);
        } else {
          event.execute(...args);
        }
      });
    }
  }
}

// Start the bot
async function start() {
  await registerCommands();
  registerEvents();

  // Start scheduler
  const schedulerService = new SchedulerService(client, repository);
  schedulerService.startDailyMeeting();

  await client.login(config.token);
}

start();
