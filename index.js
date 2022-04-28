// Util
const { Client, Collection } = require('discord.js')
const mongoose = global.mongoose = require('mongoose');
const settings = global.settings = require('./src/settings/settings.json')
const ora = global.ora = require('ora');

//Client
const client = (global.client = new Client({ intents: [32767] }))
const tokens = global.tokenler = [];

//Functions
require('./src/functions/functions');

// Slash Commands
require('./src/util/event').load(client);
const slash = require('./src/util/slash')

// Commands
client.commands = new Collection()

//Login
client.login(settings.bot.token)

let tokenler = settings.bot.tokens;

tokenler.forEach(e => {
let token = new Client({ intents: [32767] })

token.on("ready", () => {
token.idle = false;
token.uj = 0;
tokens.push(token)
});

token.login(e).catch(err => console.error(`[HELPER] ${e.substring(Math.floor(e.length / 2))} aktif edilirken bir sorun oluştu!`));
});