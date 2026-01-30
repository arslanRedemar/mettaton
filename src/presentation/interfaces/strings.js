const container = require('../../../core/di/container');

const PARAM_MAP = {
  'ready.loginSuccess': ['tag'],
  'guildMemberAdd.welcome': ['memberId'],
  'interactionCreate.commandNotFound': ['name'],
  'interactionCreate.commandError': ['name'],
};

function getStringService() {
  return container.resolve('stringService');
}

const handler = {
  get(_target, category) {
    return new Proxy({}, {
      get(_inner, name) {
        const key = `${category}.${name}`;
        const paramNames = PARAM_MAP[key];

        if (paramNames && paramNames.length > 0) {
          return (...args) => {
            const replacements = {};
            paramNames.forEach((pName, i) => {
              replacements[pName] = args[i];
            });
            return getStringService().get(key, replacements);
          };
        }
        return getStringService().get(key);
      },
    });
  },
};

module.exports = new Proxy({}, handler);
