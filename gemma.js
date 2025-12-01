const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "gemma",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("⚠️ Please provide a prompt.", event.threadID, event.messageID);

    try {
      const apiUrl = `${await mahmud()}/api/gemma?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      api.sendMessage(response.data.response || "❌ No response from Gemma AI.", event.threadID, event.messageID);

    } catch (err) {
      console.error(err.response?.data || err.message);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
