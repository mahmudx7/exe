const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "sing",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "music",
    guide: "{p}sing [song name]"
  },

  onStart: async function ({ api, event, args, message }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    if (!args[0]) {
      return message.reply("❌ | Please provide a song name.\n\nExample: sing shape of you");
    }

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `${await mahmud()}/api/song?query=${query}`;

    try {
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      message.reply({
        body: `✅ | Here's your requested song:\n➡️ ${args.join(" ")}`,
        attachment: response.data
      }, () => {
        api.setMessageReaction("🐤", event.messageID, () => {}, true);
      });

    } catch {
      message.reply("🥹error, Contact MahMUD.");
    }
  }
};
