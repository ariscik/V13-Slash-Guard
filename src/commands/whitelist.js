const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { whitelist } = require("../database/schemas")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Güvenli listeye eklemenizi/çıkarmanızı sağlar!')
        .addUserOption(option =>
            option
                .setName("member")
                .setDescription("Eklemek/Çıkarmak istediğiniz kişiyi seçin!")
                .setRequired(false)
        ),
    run: async (interaction) => {
        const user = interaction.options.getMember("member");
        if (user) {
            const secim = new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu().setPlaceholder('Güvenli Ekle/Çıkar!').setCustomId('kurulumselect')
                .addOptions([
                    { label: "Full!", description: "Kişiyi full olarak güvenli ekle!", value: "full" },
                    { label: "Role & Channel!", description: "Kişiyi Role & Channel olarak güvenli ekle!", value: "rolec" },
                    { label: "Ban & Kick!", description: "Kişiyi Ban & Kick olarak güvenli ekle!", value: "bank" },
                ]));
            interaction.reply({
                content: `${interaction.guild.name} Güvenli sistemine hoş geldin! Hangi listeye eklemek istiyorsun?`,
                components: [secim]
            });
        } else {
            const bilgi = new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu().setPlaceholder('Detaylı Bilgi!').setCustomId('bilgiselect')
                .addOptions([
                    { label: "Güvenli Liste Bilgi!", description: "Güvenli liste hakkında bilgi al!", value: "bilgi" },
                    { label: "Güvenli Liste!", description: "Güvenli kişileri listele!", value: "liste" },
                ]));
            interaction.reply({ content: `${interaction.guild.name} Güvenli sistemine hoş geldin!`, components: [bilgi] });
        }
        client.on("interactionCreate", async (interaction) => {
            if (interaction.values[0] == "bilgi") {
                await interaction.reply({
                    embeds: [new Discord.MessageEmbed().setDescription(`
**Full Güvenli İşlemleri ;**
\`\`\` Rol, kanal, ban, kick gibi gibi \`\`\`

**Role & Channel Güvenli İşlemleri ;**
\`\`\` Rol, kanal \`\`\`

**Ban & Kick Güvenli İşlemleri ;**
\`\`\` Ban, Kick \`\`\`                    
                `)], ephemeral: true
                })
            }
            if (interaction.values[0] == "liste") {
                const wht = await whitelist.findOne({ 
                    guildID: interaction.guild.id
                })
                await interaction.reply({
                    embeds: [new Discord.MessageEmbed().setDescription(`
\`\`\`Full yetkiye sahip kişiler ; \`\`\`
${wht.full ? wht.full.map(id => `<@${id}> \`(${id})\``).join('\n') : 'Full güvenli datasında hiç üye yok.'}
     
\`\`\`Role & Channel yetkiye sahip kişiler ; \`\`\`
${wht.rolec ? wht.rolec.map(id => `<@${id}> \`(${id})\``).join('\n') : 'Role & Channel güvenli datasında hiç üye yok.'}

\`\`\`Ban & Kick yetkiye sahip kişiler ; \`\`\`
${wht.bank ? wht.bank.map(id => `<@${id}> \`(${id})\``).join('\n') : 'Ban & Kick güvenli datasında hiç üye yok.'}

                `)], ephemeral: true
                })
            }
            if (interaction.values[0] == "full") {
                let wht = await whitelist.findOne({
                    guildID: interaction.guild.id
                })
                if (wht && wht.full?.includes(user.id)) {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { full: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **FULL** datasından çıkardım!
                    `, ephemeral: true
                    })
                } else {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { full: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **FULL** datasına güvenli olarak ekledim!
                    `, ephemeral: true
                    })
                }
            }
            if (interaction.values[0] == "rolec") {
                let wht = await whitelist.findOne({
                    guildID: interaction.guild.id
                })
                if (wht && wht.rolec.includes(user.id)) {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { rolec: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **Role & Channel** datasından çıkardım!
                    `, ephemeral: true
                    })
                } else {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { rolec: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **Role & CHannel** datasına güvenli olarak ekledim!
                    `, ephemeral: true
                    })
                }
            }
            if (interaction.values[0] == "bank") {
                let wht = await whitelist.findOne({
                    guildID: interaction.guild.id
                })
                if (!wht.bank.includes(user.id)) {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $pull: { bank: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **Ban & Kick** datasından çıkardım!
                    `, ephemeral: true
                    })
                } else {
                    await whitelist.findOneAndUpdate(
                        { guildID: interaction.guild.id },
                        { $push: { bank: user.id } },
                        { upsert: true }
                    );
                    await interaction.reply({
                        content: `
Tebrikler! ${user} kişisini **Ban & Kick** datasına güvenli olarak ekledim!
                    `, ephemeral: true
                    })
                }
            }
        })
    },
};
