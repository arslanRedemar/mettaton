const commands = require('../commands');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, repository) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

    if (!command) {
      console.error(`명령어를 찾을 수 없음: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction, repository);
    } catch (error) {
      console.error(`명령어 실행 오류: ${interaction.commandName}`, error);
      const reply = { content: '❌ 명령어 실행 중 오류가 발생했습니다.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
