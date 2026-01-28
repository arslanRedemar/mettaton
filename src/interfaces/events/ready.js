module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ 로그인 성공: ${client.user.tag}`);
  },
};
