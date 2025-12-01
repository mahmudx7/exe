const axios = require("axios");

const getBaseApi = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return res.data.mahmud;
};

module.exports = {
  config: {
    name: "deepseek",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{p}deepseek <prompt>"
  },

  onStart: async function ({ api, event, args }) {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }
    if (!args.length) 
      return api.sendMessage(
        "⚠️ Please provide a prompt.\nExample: deepseek Explain relativity",
        event.threadID,
        event.messageID
      );

    const prompt = args.join(" ");

    try {
      const baseApi = await getBaseApi();
      const apiUrl = `${baseApi}/api/deepseek?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const replyText = response.data.response || "No response from AI.";

      api.sendMessage(replyText, event.threadID, event.messageID);
    } catch (error) {
      console.error("DeepSeek command error:", error.response?.data || error.message);
      api.sendMessage(
        "🥹error, contact MahMUD.",
        event.threadID,
        event.messageID
      );
    }
  }
};
