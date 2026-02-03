const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const strings = require('../../interfaces/strings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('비활동추방')
    .setDescription('비활동 회원을 추방합니다')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, inactiveMemberService) {
    try {
      const guild = interaction.guild;
      await guild.members.fetch();

      const kickableList = inactiveMemberService.getKickableInactiveMembers(guild);

      if (kickableList.length === 0) {
        console.log(`[inactive/kick] No kickable inactive members found, requested by ${interaction.user.tag}`);
        return interaction.reply({ content: strings.inactive.kickNoTarget, ephemeral: true });
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('inactive_kick_confirm')
          .setLabel('확인')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('inactive_kick_cancel')
          .setLabel('취소')
          .setStyle(ButtonStyle.Secondary),
      );

      const response = await interaction.reply({
        content: strings.inactive.kickConfirm(kickableList.length),
        components: [row],
        ephemeral: true,
      });

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          componentType: ComponentType.Button,
          time: 30_000,
        });

        if (confirmation.customId === 'inactive_kick_cancel') {
          console.log(`[inactive/kick] Kick cancelled by ${interaction.user.tag}`);
          return confirmation.update({
            content: strings.inactive.kickCancelled,
            components: [],
          });
        }

        await confirmation.update({
          content: strings.inactive.kickProgress(0, kickableList.length),
          components: [],
        });

        const kickReason = inactiveMemberService.getKickReason();
        let success = 0;
        let fail = 0;

        for (let i = 0; i < kickableList.length; i++) {
          const { member } = kickableList[i];
          try {
            await member.kick(kickReason);
            console.log(`[inactive/kick] Kicked ${member.user.tag} (${member.id})`);
            success++;
          } catch (error) {
            console.error(`[inactive/kick] ${error.constructor.name}: Failed to kick ${member.user.tag} (${member.id}):`, error);
            fail++;
          }

          // Update progress every 5 kicks
          if ((i + 1) % 5 === 0) {
            try {
              await interaction.editReply({
                content: strings.inactive.kickProgress(i + 1, kickableList.length),
              });
            } catch (error) {
              console.error(`[inactive/kick] ${error.constructor.name}: Failed to update progress message:`, error);
            }
          }
        }

        try {
          if (fail === 0) {
            console.log(`[inactive/kick] All ${success} member(s) kicked successfully by ${interaction.user.tag}`);
            await interaction.editReply({
              content: strings.inactive.kickSuccess(success),
            });
          } else {
            console.log(`[inactive/kick] Kick completed: ${success} success, ${fail} failed, by ${interaction.user.tag}`);
            await interaction.editReply({
              content: strings.inactive.kickPartialFail(success, fail),
            });
          }
        } catch (error) {
          console.error(`[inactive/kick] ${error.constructor.name}: Failed to send final result message:`, error);
        }
      } catch (error) {
        if (error.message?.includes('time')) {
          console.log(`[inactive/kick] Kick confirmation timed out for ${interaction.user.tag}`);
          try {
            await interaction.editReply({
              content: strings.inactive.kickTimeout,
              components: [],
            });
          } catch (editError) {
            console.error(`[inactive/kick] ${editError.constructor.name}: Failed to send timeout message:`, editError);
          }
        } else {
          console.error(`[inactive/kick] ${error.constructor.name}: Button interaction failed:`, error);
          throw error;
        }
      }
    } catch (error) {
      console.error(`[inactive/kick] ${error.constructor.name}: Failed to execute kick command for ${interaction.user.tag}:`, error);
      throw error;
    }
  },
};
