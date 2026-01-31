const strings = require('./strings');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(strings.ready.loginSuccess(client.user.tag));
  },
};
