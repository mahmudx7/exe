const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "ai",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ api, event, args }) {
   const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    if (!args.length) {
      return api.sendMessage("Please provide a question", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiUrl = `${await mahmud()}/api/ai`;

    try {
      const response = await axios.post(
        apiUrl,
        { question: query },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      api.sendMessage(response.data.response || "Sorry, I couldn't generate a response.", event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("🥹error, contact MahMUD", event.threadID, event.messageID);
    }
  }
};
