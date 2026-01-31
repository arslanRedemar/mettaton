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

  async execute(interaction, repository) {
    const days = repository.getInactiveDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const guild = interaction.guild;
    await guild.members.fetch();

    const activities = repository.getAllMemberActivities();
    const activityMap = new Map();
    for (const row of activities) {
      activityMap.set(row.user_id, new Date(row.last_active_at));
    }

    const botMember = guild.members.me;
    const inactiveMembers = [];
    for (const [, member] of guild.members.cache) {
      if (member.user.bot) continue;
      if (member.id === guild.ownerId) continue;
      if (botMember && member.roles.highest.position >= botMember.roles.highest.position) continue;

      const lastActive = activityMap.get(member.id);
      if (!lastActive || lastActive < cutoffDate) {
        inactiveMembers.push(member);
      }
    }

    if (inactiveMembers.length === 0) {
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
      content: strings.inactive.kickConfirm(inactiveMembers.length),
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
        content: strings.inactive.kickProgress(0, inactiveMembers.length),
        components: [],
      });

      let success = 0;
      let fail = 0;

      for (let i = 0; i < inactiveMembers.length; i++) {
        try {
          await inactiveMembers[i].kick(`비활동 ${days}일 이상`);
          console.log(`[inactive/kick] Kicked ${inactiveMembers[i].user.tag} (${inactiveMembers[i].id})`);
          success++;
        } catch (error) {
          console.error(`[inactive/kick] Failed to kick ${inactiveMembers[i].user.tag} (${inactiveMembers[i].id}):`, error);
          fail++;
        }

        if ((i + 1) % 5 === 0) {
          await interaction.editReply({
            content: strings.inactive.kickProgress(i + 1, inactiveMembers.length),
          });
        }
      }

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
    } catch {
      console.log(`[inactive/kick] Kick confirmation timed out for ${interaction.user.tag}`);
      await interaction.editReply({
        content: strings.inactive.kickTimeout,
        components: [],
      });
    }
  },
};
