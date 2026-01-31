const { REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');

// Core
const config = require('../core/config');
const container = require('../core/di/container');

// Data Layer
const client = require('./data/datasource/discordClient');
const { initializeDatabase, closeDatabase } = require('./data/datasource/database');
const { SqliteRepository } = require('./data/repositories');

// Domain Layer - Usecases
const { SchedulerService, MoonCalendarService, StringService, PointAccumulationService } = require('./domain/usecases');

// Presentation Layer
const commands = require('./presentation/controllers');
const events = require('./presentation/interfaces');

// Ensure data directory exists
const dataDir = path.dirname(config.database.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
initializeDatabase(config.database.path);

// Initialize dependencies
const repository = new SqliteRepository();
repository.init();

const stringService = new StringService(repository);
stringService.loadFromDatabase();
container.register('stringService', stringService);

const moonCalendarService = new MoonCalendarService(path.join(__dirname, '..', config.calendarDir));
const schedulerService = new SchedulerService(client, repository);
const pointAccumulationService = new PointAccumulationService(repository);

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    console.log('⌛ 슬래시 명령어 등록 중...');

    // Clear global commands (in case any were registered globally before)
    await rest.put(Routes.applicationCommands(config.clientId), { body: [] });

    // Register guild commands
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
          event.execute(...args, repository, schedulerService, pointAccumulationService);
        } else if (event.name === 'messageCreate') {
          event.execute(...args, { moonCalendarService, repository, pointAccumulationService });
        } else if (event.name === 'messageDelete') {
          event.execute(...args, repository);
        } else if (event.name === 'messageReactionAdd' || event.name === 'messageReactionRemove') {
          event.execute(...args, repository, pointAccumulationService);
        } else {
          event.execute(...args);
        }
      });
    }
  }
}

// Graceful shutdown
function setupGracefulShutdown() {
  const shutdown = () => {
    console.log('🛑 봇 종료 중...');
    schedulerService.cancelSchedule();
    closeDatabase();
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start the bot
async function start() {
  setupGracefulShutdown();
  await registerCommands();
  registerEvents();

  // Start scheduler
  schedulerService.start();

  await client.login(config.token);
}

start();
