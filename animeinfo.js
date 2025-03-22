const axios = require("axios");

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["aniinfo"],
    version: "1.7",
    category: "anime",
    description: "Fetches detailed information about an anime.",
    usage: "animeinfo <anime name>",
    cooldown: 5,
    author: "MahMUD"
  },

  onStart: async function ({ api, event, args }) {  
    if (!args.length) {
      return api.sendMessage("⚠️ Please provide an anime name!", event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(" "));
    const url = `https://mahmud-animeinfo.onrender.com/animeinfo?animeName=${query}`;

    try {
      const response = await axios.get(url);
      const animeInfo = response.data;

      if (!animeInfo || !animeInfo.data) {
        return api.sendMessage("❌ Anime not found!", event.threadID, event.messageID);
      }

      const { formatted_message, data } = animeInfo;
      
      const message = {
        body: formatted_message,
        attachment: await global.utils.getStreamFromURL(data.image_url)
      };

      api.sendMessage(message, event.threadID, event.messageID);
      
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ Error fetching anime information. Try again later!", event.threadID, event.messageID);
    }
  }
};
