const ready = require('./ready');
const guildMemberAdd = require('./guildMemberAdd');
const interactionCreate = require('./interactionCreate');
const messageCreate = require('./messageCreate');
const messageDelete = require('./messageDelete');

module.exports = [ready, guildMemberAdd, interactionCreate, messageCreate, messageDelete];
