const slash = {
  register: async (clientId, commands) => {
    const loadSlash = ora(`Eğik çizgi komutları yükleniyor.`).start();

    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v9");

    const rest = new REST({ version: "9" }).setToken(settings?.bot?.token);

    try {
      const guildId = settings.guild?.id;
      if (!isNaN(guildId)) {
        await rest
          .put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
          })
          .then(() => {
            return loadSlash.succeed(`Eğik çizgi komutları sunucuya yüklendi.`);
          });
      } else {
        await rest
          .put(Routes.applicationCommands(clientId), { body: commands })
          .then(() => {
            loadSlash.succeed(`Eğik çizgi komutları yüklendi.`);
          });
      }
    } catch (error) {
      loadSlash.warn(`Eğik çizgi komutları yüklenemedi, hata: \n ${error}`);
    }
  },
};

module.exports = slash;
