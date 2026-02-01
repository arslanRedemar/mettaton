const commands = require('../controllers');
const strings = require('./strings');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, repository, schedulerService, pointAccumulationService, quizService) {
    if (interaction.isAutocomplete()) {
      const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction, repository);
        } catch (error) {
          console.error(`[interactionCreate] Autocomplete error for /${interaction.commandName}:`, error);
        }
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

    if (!command) {
      console.error(`[interactionCreate] Command not found: /${interaction.commandName} (user: ${interaction.user.tag})`);
      return;
    }

    const userTag = interaction.user.tag;
    const userId = interaction.user.id;

    try {
      await command.execute(interaction, repository, schedulerService, pointAccumulationService, quizService);
      console.log(`[interactionCreate] Command /${interaction.commandName} executed successfully (user: ${userTag}, ${userId})`);
    } catch (error) {
      console.error(`[interactionCreate] Command /${interaction.commandName} failed (user: ${userTag}, ${userId}):`, error);
      const reply = { content: strings.interactionCreate.executionError, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
