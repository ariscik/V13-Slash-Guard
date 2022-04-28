const { SlashCommandBuilder } = require("@discordjs/builders");
const { channels } = require("../database/schemas")
const Discord = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('kanalkur')
        .setDescription('Kanal kurmanızı sağlar!')
        .addStringOption(option =>
            option
                .setName("kanalid")
                .setDescription("Kurmak istediğiniz kanal idsini girin!!")
                .setRequired(true)
        ),
    run: async (interaction) => {
        const kanal = interaction.options.getString("kanalid");
        channels.findOne({ guildID: settings.guild.id, channelID: kanal }, async (err, channelData) => {
            if (!channelData) return interaction.channel.send({ content: `Belirttiğin kanalın bir datası bulunmamakta! Kanal ID'si yanlış olabilir. Kontrol etmelisin!` })
                interaction.reply({ 
                    embeds: [new Discord.MessageEmbed().setDescription(`
\`${channelData.name}\` adlı **kanal** yedeği kullanılarak **kanal** oluşturulacak.
                    `)]
                 })
                    setTimeout(async function () {
                        interaction.guild.channels.create(channelData.name, { type: channelData.type }).then(async channel => {
                            if (channel.type === "GUILD_VOICE") {
                                channel.setBitrate(channelData.bitrate);
                                channel.setUserLimit(channelData.userLimit);
                                channel.setParent(channelData.parentID);
                                channel.setPosition(channelData.position);

                                if (Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                                    for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                                        channel.permissionOverwrites.create(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisPermOverwrites);
                                    };
                                };

                            } else if (channel.type === "GUILD_CATEGORY") {
                                if (Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                                    for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                                        channel.permissionOverwrites.create(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisPermOverwrites);
                                    };
                                };
                                const textChannels = await channels.find({ parentID: kanal }); 
                                textChannels.forEach(c => { 
                                    const textChannel = interaction.guild.channels.cache.get(c.channelID); 
                                    if (textChannel) textChannel.setParent(channel, { lockPermissions: false }); 
                                });
                            } else {
                                channel.setRateLimitPerUser(channelData.setRateLimitPerUser);
                                channel.setTopic(channelData.topic);
                                channel.setParent(channelData.parentID);
                                channel.setPosition(channelData.position);

                                if (Object.keys(channelData.permissionOverwrites[0]).length > 0) {
                                    for (let i = 0; i < Object.keys(channelData.permissionOverwrites[0]).length; i++) {
                                        channel.permissionOverwrites.create(channelData.permissionOverwrites[0][i].permission, channelData.permissionOverwrites[0][i].thisPermOverwrites);
                                    };
                                };
                            };
                        });
                    }, 500);
        })
    },
};