client.findChannel = function (channelName) {
    try {
        return client.channels.cache.find(x => x.name === channelName)
    } catch (err) {
        return undefined;
    }
};

