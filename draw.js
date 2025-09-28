const axios = require("axios");

const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
const apiUrl = base.data.mahmud;

module.exports = {
  config: {
    name: "draw",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "image",
    guide: { en: "{p}draw [prompt]" }
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

    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage(
      "❌ | Example: draw cyberpunk samurai",
      event.threadID,
      event.messageID
    );

    try {
      const response = await axios.post(`${apiUrl}/api/draw`, { prompt });
      const imageUrl = response.data.image;

      await api.sendMessage({
        body: `🎨 | Prompt: ${prompt}`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
