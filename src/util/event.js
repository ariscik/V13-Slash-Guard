const fs = require('fs')

const event = {
    load: async (client) => {
        const events = fs
            .readdirSync("./src/events").filter(file => file.endsWith('.js'))

        events.forEach(event => {
            const eventFile = require(`../events/${event}`)
            if (eventFile.oneTime) {
                client.once(eventFile.event, (...args) => eventFile.run(...args))
            } else if(eventFile.ws) {
                client.ws.on(eventFile.event, (...args) => eventFile.run(...args))
            } else {
                client.on(eventFile.event, (...args) => eventFile.run(...args))
            }
        })
    }
}

module.exports = event;