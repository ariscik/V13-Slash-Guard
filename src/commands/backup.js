const { SlashCommandBuilder } = require("@discordjs/builders");
const { role, channels } = require("../database/schemas")
const Discord = require("discord.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Sunucu içerisi kayıt işlemlerini yapabilirsiniz!'),
    run: async (interaction) => {
        const kislem = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton().setCustomId('hepsi').setLabel(`⚙️ Sunucu`).setStyle('SUCCESS'),
            new Discord.MessageButton().setCustomId('rol').setLabel(`👤 Rol`).setStyle('SUCCESS'),
            new Discord.MessageButton().setCustomId('kanal').setLabel(`💬 Kanal`).setStyle('SUCCESS'),
        )
        interaction.reply({
            embeds: [new Discord.MessageEmbed().setDescription(`
${interaction.member} Merhaba! ${interaction.guild.name} sunucu içerisi rol kanal kaydetmeleri için bu menüyü kullanabilirsin!

\`\`\`Sunucu Butonu\`\`\`
\`>\` **Sunucudaki tüm (ROL - KANAL) verilerinin yedeklenmesini sağlar!**

\`\`\`Rol Butonu\`\`\`
\`>\` **Sunucudaki tüm (ROL) verilerinin yedeklenmesini sağlar!**

\`\`\`Kanal Butonu\`\`\`
\`>\` **Sunucudaki tüm (KANAL) verilerinin yedeklenmesini sağlar!**
            `)], components: [kislem]
        })

        client.on("interactionCreate", async (button) => {
            if (button.customId == "hepsi") {
                rolBackup();
                channelBackup();
                await button.reply({ content: `Tüm sunucu verileri yedeklendi!`, ephemeral: true})
            }
            if (button.customId == "rol") {
                rolBackup();
                await button.reply({ content: `Tüm rol verileri yedeklendi!`, ephemeral: true })
            }
            if (button.customId == "kanal") {
                channelBackup();
                await button.reply({ content: `Tüm kanal verileri yedeklendi!`, ephemeral: true })
            }
        })

    },
};







function rolBackup() {
    let guild = client.guilds.cache.get(settings.guild.id);
    if (guild) {
        guild.roles.cache.filter(e => e.name !== "@everyone" && !e.managed).forEach(rol => {
            let roleChannelOverwrites = [];
            guild.channels.cache.filter(e => e.permissionOverwrites.cache.has(rol.id)).forEach(e => {
                let kanalPerm = e.permissionOverwrites.cache.get(rol.id);
                let pushla = { id: e.id, allow: kanalPerm.allow.toArray(), deny: kanalPerm.deny.toArray() };
                roleChannelOverwrites.push(pushla);
            });

            role.findOne({ guildID: settings.guild.id, rolID: rol.id }, async (err, rolKayit) => {
                if (!rolKayit) {
                    let newRolSchema = new role({
                        guildID: settings.guild.id,
                        roleID: rol.id,
                        name: rol.name,
                        color: rol.hexColor,
                        hoist: rol.hoist,
                        position: rol.position,
                        permissions: rol.permissions.bitfield,
                        mentionable: rol.mentionable,
                        time: Date.now(),
                        members: rol.members.map(m => m.id),
                        channelOverwrites: roleChannelOverwrites
                    });
                    newRolSchema.save();
                } else {
                    rolKayit.name = rol.name;
                    rolKayit.color = rol.hexColor;
                    rolKayit.hoist = rol.hoist;
                    rolKayit.position = rol.position;
                    rolKayit.permissions = rol.permissions.bitfield;
                    rolKayit.mentionable = rol.mentionable;
                    rolKayit.time = Date.now();
                    rolKayit.members = rol.members.map(m => m.id);
                    rolKayit.channelOverwrites = roleChannelOverwrites;
                    rolKayit.save();
                };
            });
        });

        role.find({ guildID: settings.guild.id }).sort().exec((err, rol) => {
            rol.filter(e => !guild.roles.cache.has(e.roleID) && Date.now() - e.time > 1000 * 60 * 60 * 24 * 3).forEach(r => {
                role.findOneAndDelete({ roleID: r.roleID });
            });
        });
    };
};


function channelBackup() {
    let guild = client.guilds.cache.get(settings.guild.id);
    if (guild) {
        guild.channels.cache.filter(kanal => kanal.deleted !== true).forEach(channel => {
            let permissionss = {};
            let sayi = Number(0);
            channel.permissionOverwrites.cache.forEach((perm) => {
                let thisPermOverwrites = {};
                perm.allow.toArray().forEach(p => {
                    thisPermOverwrites[p] = true;
                });
                perm.deny.toArray().forEach(p => {
                    thisPermOverwrites[p] = false;
                });
                permissionss[sayi] = { permission: perm.id == null ? guild.id : perm.id, thisPermOverwrites };
                sayi++;
            });

            channels.findOne({ guildID: settings.guild.id, channelID: channel.id }, async (err, savedChannel) => {
                if (!savedChannel) {
                    if (channel.type === "GUILD_VOICE") {
                        let newChannelSchema = new channels({
                            guildID: settings.guild.id,
                            channelID: channel.id,
                            name: channel.name,
                            parentID: channel.parentId,
                            position: channel.position,
                            time: Date.now(),
                            type: channel.type,
                            permissionOverwrites: permissionss,
                            userLimit: channel.userLimit,
                            bitrate: channel.bitrate
                        });
                        newChannelSchema.save();
                    } else if (channel.type === "GUILD_CATEGORY") {
                        let newChannelSchema = new channels({
                            guildID: settings.guild.id,
                            channelID: channel.id,
                            name: channel.name,
                            position: channel.position,
                            time: Date.now(),
                            type: channel.type,
                            permissionOverwrites: permissionss,
                        });
                        newChannelSchema.save();
                    } else {
                        let newChannelSchema = new channels({
                            guildID: settings.guild.id,
                            channelID: channel.id,
                            name: channel.name,
                            parentID: channel.parentId,
                            position: channel.position,
                            time: Date.now(),
                            nsfw: channel.nsfw,
                            rateLimitPerUser: channel.rateLimitPerUser,
                            type: channel.type,
                            topic: channel.topic ? channel.topic : "Bu kanal Backup botu tarafından kurtarıldı!",
                            permissionOverwrites: permissionss,
                        });
                        newChannelSchema.save();
                    }
                } else {
                    if (channel.type === "GUILD_VOICE") {
                        savedChannel.name = channel.name;
                        savedChannel.parentID = channel.parentId;
                        savedChannel.position = channel.position;
                        savedChannel.type = channel.type;
                        savedChannel.time = Date.now();
                        savedChannel.permissionOverwrites = permissionss;
                        savedChannel.userLimit = channel.userLimit;
                        savedChannel.bitrate = channel.bitrate;
                        savedChannel.save();
                    } else if (channel.type === "GUILD_CATEGORY") {
                        savedChannel.name = channel.name;
                        savedChannel.position = channel.position;
                        savedChannel.type = channel.type;
                        savedChannel.time = Date.now();
                        savedChannel.permissionOverwrites = permissionss;
                        savedChannel.save();
                    } else {
                        savedChannel.name = channel.name;
                        savedChannel.parentID = channel.parentId;
                        savedChannel.position = channel.position;
                        savedChannel.nsfw = channel.nsfw;
                        savedChannel.rateLimitPerUser = channel.rateLimitPerUser;
                        savedChannel.type = channel.type;
                        savedChannel.time = Date.now();
                        savedChannel.topic = channel.topic ? channel.topic : "Bu kanal Backup botu tarafından kurtarıldı!";
                        savedChannel.permissionOverwrites = permissionss;
                        savedChannel.save();
                    }
                };
            });
        });

        channels.find({ guildID: settings.guild.id }).sort().exec((err, channelses) => {
            channelses.filter(r => !guild.channels.cache.has(r.channelID) && Date.now() - r.time > 1000 * 60 * 60 * 24 * 3).forEach(r => {
                channels.findOneAndDelete({ channelID: r.channelID });
            });
        });
    };
};