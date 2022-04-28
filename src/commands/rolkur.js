const { SlashCommandBuilder } = require("@discordjs/builders");
const { role } = require("../database/schemas")
const Discord = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolkur')
        .setDescription('Rol kurmanızı sağlar!')
        .addStringOption(option =>
            option
                .setName("rolid")
                .setDescription("Kurmak istediğiniz rolün idsini girin!!")
                .setRequired(true)
        ),
    run: async (interaction) => {
        const rol = interaction.options.getString("rolid");
        role.findOne({ guildID: settings.guild.id, roleID: rol }, async (err, roleData) => {
            if (!roleData) return interaction.reply({ content: `Belirttiğin rolün bir datası bulunmamakta! Rol ID'si yanlış olabilir. Kontrol etmelisin!`, ephemeral: true})
            await interaction.reply({ embeds: [new Discord.MessageEmbed().setDescription(`
${roleData.name} rolün yedeği oluşturuluyor! \`${roleData.members.length}\` sayıda üyelere dağıtılacaktır.  
                `)], ephemeral: true})
                    setTimeout(async function () {
                        let yeniRol = await interaction.guild.roles.create({
                                name: roleData.name,
                                color: roleData.color,
                                hoist: roleData.hoist,
                                permissions: roleData.permissions,
                                position: roleData.position,
                                mentionable: roleData.mentionable,
                                reason: `Güvenlik amaçlı yeniden açılıp dağıtılıyor.`
                        });

                        setTimeout(() => {
                            let kanalPermler = roleData.channelOverwrites;
                            if (kanalPermler) kanalPermler.forEach((perm, index) => {
                                let kanal = interaction.guild.channels.cache.get(perm.id);
                                if (!kanal) return;
                                setTimeout(() => {
                                    let yeniKanalPermler = {};
                                    perm.allow.forEach(e => {
                                        yeniKanalPermler[e] = true;
                                    });
                                    perm.deny.forEach(e => {
                                        yeniKanalPermler[e] = false;
                                    });
                                   kanal.permissionOverwrites.create(yeniRol, yeniKanalPermler).catch(console.error);
                                }, index * 5000);
                            })
                        }, 5000);

                        let issizler = global.tokenler.filter(a => !a.idle)
                        if (!issizler.length) issizler = issizler.sort((a, b) => a.uj - b.uj)
                        if (roleData.members.length < issizler.length) return;
                        const memberPerBot = Math.floor(roleData.members.length / issizler.length)
                        for (var i = 0; i < issizler.length; i++) {
                            const guild = issizler[i].guilds.cache.get(settings.guild.id)
                            if (yeniRol.deleted) break;
                            botcuk(issizler[i], true, roleData.members.length)

                            let verilecekrol;
                            if (i == issizler - 1) verilecekrol = roleData.members.slice(i * memberPerBot)
                            else verilecekrol = roleData.members.slice(i * memberPerBot, (i + 1) * memberPerBot)

                            verilecekrol.forEach(async r => {
                                if (yeniRol.deleted) return botcuk(r, false, -roleData.members.length)
                                const member = guild.members.cache.get(r);
                                if (!member || member.roles.cache.has(yeniRol.id)) return;
                                await member.roles.add(yeniRol.id);
                            });

                            botcuk(issizler[i], false, -roleData.members.length)
                        };
                    }, 500);
        })
    },
};

function botcuk(bot, busy, job, equal = false){
    bot.idle = busy;
    if(equal) bot.uj = job;
    else bot.uj += job;
    
    let index = global.tokenler.findIndex(e => e.user.id == bot.user.id);
    global.tokenler[index] = bot;
}