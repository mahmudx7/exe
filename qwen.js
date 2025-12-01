 const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "qwen",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 2,
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    if (!args.length) return api.sendMessage("Please provide a prompt.", event.threadID, event.messageID);

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `${await mahmud()}/api/qwen?prompt=${query}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.response || "No response received.";

      api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error(error.message);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
