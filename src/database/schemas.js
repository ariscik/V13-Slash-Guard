const mongoose = require("mongoose")

const whitelist = mongoose.model("whitelist", mongoose.Schema({
    guildID: String, 
    full : Array, 
    rolec: Array, 
    bank: Array
}))

const role = mongoose.model("role", mongoose.Schema({
    guildID: String,
    roleID: String,
    name: String,
    color: String,
    hoist: Boolean,
    position: Number,
    permissions: String,
    mentionable: Boolean,
    time: Number,
    members: Array,
    channelOverwrites: Array
}))

const channels = mongoose.model("channels", mongoose.Schema({
    guildID: String,
    channelID: String,
    name: String,
    parentID: String,
    position: Number,
    permissionOverwrites: Array,
    nsfw: Boolean,
    rateLimitPerUser: Number,
    type: String,
    topic: String,
    time: Number,
    userLimit: Number,
    bitrate: Number,
}))

const permis = mongoose.model("permis", mongoose.Schema({
    guildID: String,
    roller: Array
}))

module.exports = { whitelist, role, channels, permis }