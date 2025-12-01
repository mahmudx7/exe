const axios = require("axios");

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: "stream" });
  return response.data;
}

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "anisr",
    aliases: ["animesr"],
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
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const keyword = args.join(" ");
    if (!keyword) {
      return api.sendMessage(
        "❌ Please provide a keyword.\nExample: {p}anisr goku reels",
        event.threadID,
        event.messageID
      );
    }

    try {
      const apiUrl = await mahmud();
      const response = await axios.get(`${apiUrl}/api/tiktok?keyword=${encodeURIComponent(keyword)}`);
      const videos = response.data.videos;

      if (!videos || videos.length === 0) {
        return api.sendMessage(
          `❌ No anime videos found for: ${keyword}`,
          event.threadID,
          event.messageID
        );
      }

      const selectedVideo = videos[0];
      const videoUrl = selectedVideo.play;

      if (!videoUrl) {
        return api.sendMessage("⚠️ Error: Video not found.", event.threadID, event.messageID);
      }

      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage(
        {
          body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 😘>`,
          attachment: videoStream,
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "🥹error, contact MahMUD",
        event.threadID,
        event.messageID
      );
    }
  }
};
