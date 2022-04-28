const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const { permis } = require("../database/schemas")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('koruma')
        .setDescription('Yetkileri açmanızı/kapatmanızı sağlar!'),
    run: async (interaction) => {
        const yislem = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton().setCustomId('kac').setLabel(`🔒 Koruma Aç!`).setStyle('SUCCESS'),
            new Discord.MessageButton().setCustomId('kkapat').setLabel(`🔓 Koruma Kapat!`).setStyle('DANGER'),
        )
        interaction.reply({
            embeds: [new Discord.MessageEmbed().setDescription(`
Merhaba ${interaction.member}! ${interaction.guild.name} sunucusu yetki sistemine hoş geldin! 

\`>\` Aşağıdaki butonlardan istediğin işlemi seçerek başlatabilirsin!

\`\`\` Koruma aç \`\`\`
**Bu işlem ile tüm \`rollerin\` yetkileri kapatılır ve dataya kaydedilir.**

\`\`\` Koruma kapat \`\`\`
**Bu işlem ile tüm \`rollerin\` yetkileri data verisine göre açılır.**
            `)], components: [yislem]
        });
        client.on("interactionCreate", async(button) => {
            if (button.customId == "kac") {
                ytKapat(settings.guild.id)
                await button.reply({ content: `Sunucu içerisi tüm **rollerin** yetkileri kapatıldı!`, ephemeral: true })
            }
            if (button.customId == "kkapat") {
                const permisi = await permis.findOne({ guildID: settings.guild.id })
                if (!permisi) { 
                    button.deferUpdate();
                    interaction.channel.send({ content: `Malesef bir data bulunamadı!` })
                }
                permisi.roller.forEach((permission) => { 
                    const role = button.guild.roles.cache.get(permission.rol); 
                    if (role) role.setPermissions(permission.perm);
                })
                await permisi.deleteOne({ guildID: settings.guild.id })
                await button.reply({ content: `Sunucu içerisi tüm **rollerin** yetkileri açıldı ve data temizlendi!`, ephemeral: true })
            }
        })
    },
};


async function ytKapat(guildID) { 
    let arr = []; 
    const yetkiPermleri = ["8", "268435456", "16", "536870912", "4", "2", "134217728", "1073741824", "536870912"]; 
    const guild = client.guilds.cache.get(guildID); 
    guild.roles.cache.filter(rol => rol.editable).filter(rol => yetkiPermleri.some(yetki => rol.permissions.has(yetki)) && !rol.managable).forEach(async (rol) => { arr.push({ rol: rol.id, perm: rol.permissions.bitfield.toString().replace('n','') }); 
    permis.findOne({ guildID: settings.guild.id }, async (err, res) => { 
        let newData = new permis({ 
            guildID: settings.guild.id, 
            roller: arr
        }); 
        newData.save(); 
    }); 
        rol.setPermissions(0n) 
    })
}
