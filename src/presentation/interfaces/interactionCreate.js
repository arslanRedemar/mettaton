const commands = require('../controllers');
const strings = require('./strings');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, repository, schedulerService) {
    if (interaction.isAutocomplete()) {
      const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

    if (!command) {
      console.error(strings.interactionCreate.commandNotFound(interaction.commandName));
      return;
    }

    try {
      await command.execute(interaction, repository, schedulerService);
    } catch (error) {
      console.error(strings.interactionCreate.commandError(interaction.commandName), error);
      const reply = { content: strings.interactionCreate.executionError, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
