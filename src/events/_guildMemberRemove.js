const Discord = require("discord.js");
const { whitelist, permis } = require("../database/schemas")
module.exports = {
    event: "guildMemberRemove",
    oneTime: true,
    ws: false,
    run: async (Aris) => {
        let pic = await Aris.guild.fetchAuditLogs({ type: "MEMBER_KICK" }).then(a => a.entries.first());
        let logcuk = Aris.guild.channels.cache.get(settings.guild.log)
        let ibne = Aris.guild.members.cache.get(pic.executor.id)
        if (!pic || Date.now() - pic.createdTimestamp > 5000 || await full(pic.executor.id) || await bank(pic.executor.id)) return;
        if (ibne.bannable) ibne.ban({ reason: `Aris Üye Banlama Koruması` });
        ytKapat(Aris.guild.id)
        if (logcuk) {
            logcuk.send({
                embeds: [new Discord.MessageEmbed().setDescription(`
\`>\` ${pic.executor} \`(${pic.executor.id})\` kişisi tarafından birisi banlandı!

\`>\` Kullanıcı : ${ibne.bannable ? "**Başarıyla yasaklandı!**" : "**Yasaklanamadı!**"}

\`>\` Banlanan Kişi : ${Aris} **(${Aris.id})**
                `)], content: `@everyone`
            })
        }
    },
};


async function full(kisiID) {
    const whiteList = await whitelist.findOne({ guildID: settings.guild.id });
    let uye = client.users.cache.get(kisiID);
    let guvenliler = whiteList.full || [];
    if (uye.id === client.user.id || uye.id === settings.bot.owner || uye.id === settings.guild.id.ownerId || guvenliler.some(g => g.includes(uye.id))) return true;
    else return false;
}

async function bank(kisiID) {
    const whiteList = await whitelist.findOne({ guildID: settings.guild.id });
    let uye = client.users.cache.get(kisiID);
    let guvenliler = whiteList.bank || [];
    if (uye.id === client.user.id || uye.id === settings.bot.owner || uye.id === settings.guild.id.ownerId || guvenliler.some(g => g.includes(uye.id))) return true;
    else return false;
}


async function ytKapat(guildID) {
    let arr = [];
    const yetkiPermleri = ["8", "268435456", "16", "536870912", "4", "2", "134217728", "1073741824", "536870912"];
    const guild = client.guilds.cache.get(guildID);
    guild.roles.cache.filter(rol => rol.editable).filter(rol => yetkiPermleri.some(yetki => rol.permissions.has(yetki)) && !rol.managable).forEach(async (rol) => {
        arr.push({ rol: rol.id, perm: rol.permissions.bitfield.toString().replace('n', '') });
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