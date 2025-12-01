const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.anisr;
};

module.exports = {
  config: {
    name: "anisr2",
    author: "MahMUD",
    version: "1.7",
    category: "media",
    guide: { en: "{p}{n} search" },
  },

  onStart: async function ({ api, event, args }) {
    async function fetchTikTokVideos(query) {
      try {
        const apiUrl = await mahmud();
        const response = await axios.post(
          `${apiUrl}/api/anisr/vid`,
          { query },
          { headers: { author: module.exports.config.author } }
        );
        return response.data;
      } catch {
        return null;
      }
    }

    api.setMessageReaction("😘", event.messageID, () => {}, true);

    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("use example\nanisr2 goku edit.", event.threadID, event.messageID);
    }

    const modifiedQuery = `${query} anime edit`;
    const response = await fetchTikTokVideos(modifiedQuery);

    if (!response || !response.videoUrl) {
      return api.sendMessage(`No video found.`, event.threadID, event.messageID);
    }

    try {
      const videoStream = await axios.get(response.videoUrl, { responseType: "stream" });
      api.sendMessage(
        {
          body: "𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐞𝐝𝐢𝐭𝐳 𝐯𝐢𝐝𝐞𝐨 😘",
          attachment: videoStream.data,
        },
        event.threadID,
        event.messageID
      );
    } catch {
      api.sendMessage("🥹error, contact MahMUD", event.threadID, event.messageID);
    }
  },
};
