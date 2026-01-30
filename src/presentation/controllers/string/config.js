const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const container = require('../../../../core/di/container');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('문자열설정')
    .setDescription('봇 UI 문자열 관리 (관리자 전용)')
    .addSubcommand((sub) =>
      sub
        .setName('목록')
        .setDescription('등록된 문자열 목록 조회')
        .addStringOption((opt) =>
          opt.setName('카테고리').setDescription('카테고리 필터 (예: ready, messageCreate)').setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('수정')
        .setDescription('문자열 수정')
        .addStringOption((opt) =>
          opt.setName('키').setDescription('문자열 키 (예: ready.loginSuccess)').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((opt) =>
          opt.setName('값').setDescription('새 문자열 값 (템플릿: {param})').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('초기화')
        .setDescription('문자열을 기본값으로 초기화')
        .addStringOption((opt) =>
          opt.setName('키').setDescription('초기화할 문자열 키').setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('확인')
        .setDescription('특정 문자열의 현재값과 기본값 확인')
        .addStringOption((opt) =>
          opt.setName('키').setDescription('확인할 문자열 키').setRequired(true).setAutocomplete(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async autocomplete(interaction) {
    const stringService = container.resolve('stringService');
    const focused = interaction.options.getFocused();
    const allKeys = stringService.getAllKeys();
    const filtered = allKeys.filter((entry) => entry.key.includes(focused)).slice(0, 25);
    await interaction.respond(
      filtered.map((entry) => ({
        name: `${entry.key}${entry.isOverridden ? ' (수정됨)' : ''}`,
        value: entry.key,
      }))
    );
  },

  async execute(interaction) {
    const stringService = container.resolve('stringService');
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === '목록') {
      const category = interaction.options.getString('카테고리');
      let entries = stringService.getAllKeys();

      if (category) {
        entries = entries.filter((e) => e.key.startsWith(category + '.'));
      }

      if (entries.length === 0) {
        return interaction.reply({ content: '등록된 문자열이 없습니다.', ephemeral: true });
      }

      const groups = {};
      for (const entry of entries) {
        const cat = entry.key.split('.')[0];
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(entry);
      }

      const embed = new EmbedBuilder().setTitle('봇 문자열 목록').setColor(0x5865f2);

      for (const [cat, items] of Object.entries(groups)) {
        const lines = items.map((item) => {
          const modified = item.isOverridden ? ' *수정됨*' : '';
          const params = item.params ? ` (${item.params.map((p) => `{${p}}`).join(', ')})` : '';
          return `\`${item.key}\`${modified}${params}`;
        });
        embed.addFields({ name: cat, value: lines.join('\n') });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === '수정') {
      const key = interaction.options.getString('키');
      const value = interaction.options.getString('값');
      const def = stringService.getDefault(key);

      if (!def) {
        return interaction.reply({ content: `알 수 없는 문자열 키: \`${key}\``, ephemeral: true });
      }

      if (def.params) {
        const missing = def.params.filter((p) => !value.includes(`{${p}}`));
        if (missing.length > 0) {
          return interaction.reply({
            content:
              `템플릿 변수가 누락되었습니다: ${missing.map((p) => `\`{${p}}\``).join(', ')}\n` +
              `이 문자열에는 다음 변수가 필요합니다: ${def.params.map((p) => `\`{${p}}\``).join(', ')}`,
            ephemeral: true,
          });
        }
      }

      stringService.setString(key, value);

      await interaction.reply({
        content: `문자열이 수정되었습니다.\n\n키: \`${key}\`\n이전: ${def.value}\n변경: ${value}`,
        ephemeral: true,
      });
    } else if (subcommand === '초기화') {
      const key = interaction.options.getString('키');
      const def = stringService.getDefault(key);

      if (!def) {
        return interaction.reply({ content: `알 수 없는 문자열 키: \`${key}\``, ephemeral: true });
      }

      stringService.resetString(key);

      await interaction.reply({
        content: `\`${key}\` 문자열이 기본값으로 초기화되었습니다.\n기본값: ${def.value}`,
        ephemeral: true,
      });
    } else if (subcommand === '확인') {
      const key = interaction.options.getString('키');
      const allKeys = stringService.getAllKeys();
      const entry = allKeys.find((e) => e.key === key);

      if (!entry) {
        return interaction.reply({ content: `알 수 없는 문자열 키: \`${key}\``, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`문자열 상세: \`${key}\``)
        .setColor(entry.isOverridden ? 0xffa500 : 0x00cc66)
        .addFields(
          { name: '현재값', value: entry.currentValue },
          { name: '기본값', value: entry.defaultValue },
          { name: '상태', value: entry.isOverridden ? '수정됨' : '기본값', inline: true },
          {
            name: '템플릿 변수',
            value: entry.params ? entry.params.map((p) => `\`{${p}}\``).join(', ') : '없음',
            inline: true,
          }
        );

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
