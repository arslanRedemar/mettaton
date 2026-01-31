const ready = require('./ready');
const guildMemberAdd = require('./guildMemberAdd');
const interactionCreate = require('./interactionCreate');
const messageCreate = require('./messageCreate');
const messageDelete = require('./messageDelete');
const messageReactionAdd = require('./messageReactionAdd');
const messageReactionRemove = require('./messageReactionRemove');

module.exports = [ready, guildMemberAdd, interactionCreate, messageCreate, messageDelete, messageReactionAdd, messageReactionRemove];
