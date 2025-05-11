const axios = require('axios');

module.exports = {
  config: {
    name: "anisr",
    aliases: ["tiksr", "animesr"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "anime",
    guide: {
      en: "{pn} <anime name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage("❌ | Please provide an anime name to search.", event.threadID, event.messageID);
    }

    const query = args.join(" ");

    try {
      const response = await axios.post("https://mahmud-global-apis.onrender.com/api/anisr", { query }, {
        headers: { 
          "Content-Type": "application/json",
          "author": module.exports.config.author
        }
      });

      const { title, videoUrl } = response.data;

      if (!videoUrl) {
        throw new Error("Video URL not found in API response.");
      }

      const msg = {
        body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐯𝐢𝐝𝐞𝐨`,
        attachment: await global.utils.getStreamFromURL(videoUrl)
      };

      api.sendMessage(msg, event.threadID, event.messageID);

    } catch (error) {
      console.error("error:", error?.response?.data || error.message);
      api.sendMessage("❌ | Failed to fetch anime video. Try again later.", event.threadID, event.messageID);
    }
  }
};
