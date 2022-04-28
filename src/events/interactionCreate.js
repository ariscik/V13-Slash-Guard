module.exports = {
  event: "interactionCreate",
  oneTime: false,
  ws: false,
  run: async (i) => {
    if (!i.isCommand()) return;
    const commandCheck = i.client.commands.get(i.commandName);

    if (!commandCheck) {
      return console.log(`Komut bulanamadı" '${i.commandName}'`);
    } else {
      await commandCheck.run(i);
    }
  },
};
