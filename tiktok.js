const axios = require("axios");

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: "stream" });
  return response.data;
}

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tiksr"],
    author: "MahMUD",
    version: "1.7",
    category: "media",
    shortDescription: { en: "Play TikTok video instantly" },
    longDescription: { en: "Search and play TikTok video directly by keyword." },
    guide: { en: "{p}{n} [keyword]" }
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
        "❌ Please provide a keyword.\nExample: {p}tiktok anime video",
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
          `❌ No TikTok videos found for: ${keyword}`,
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
          body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐭𝐢𝐤𝐭𝐨𝐤 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲 😘>`,
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
