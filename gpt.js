const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "gpt",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    if (!args.length) return api.sendMessage("Please provide a question.", event.threadID, event.messageID);

    const query = args.join(" ");
    const apiUrl = `${await baseApiUrl()}/api/gpt`;

    try {
      const response = await axios.post(apiUrl, {
        question: query,
        contents: [{ parts: [{ text: query }] }]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const replyText = response.data.response || "No response received.";
      const info = await api.sendMessage(replyText, event.threadID, event.messageID);

    
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("🥹error, contact MahMUD", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, args }) {
    const replyInfo = global.GoatBot.onReply.get(event.messageReply?.messageID);
    if (!replyInfo || replyInfo.author !== event.senderID) return;

    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a question.", event.threadID, event.messageID);

    const apiUrl = `${await baseApiUrl()}/api/gpt`;

    try {
      const response = await axios.post(apiUrl, {
        question: prompt,
        contents: [{ parts: [{ text: prompt }] }]
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const replyText = response.data.response || "No response received.";
      api.sendMessage(replyText, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("Error occurred, please try again later 🥹", event.threadID, event.messageID);
    }
  }
};
