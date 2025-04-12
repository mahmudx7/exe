const axios = require('axios');

module.exports = {
    config: {
    name: "anisr",
    aliases: ["tiksr", "tiktoksr"],
    author: "MahMUD",
    version: "1.7",
    category: "meida",
    guide: { en: "{p}{n} [query]" },
  },
  onStart: async function ({ api, event, args }) {
    async function fetchTikTokVideos(query) {
    try {
    const response = await axios.post(
   'https://mahmud-anisr-api.onrender.com/api/anisr/vid', 
    { query },
    { headers: { "author": module.exports.config.author } }
     );
    return response.data; 
  } catch (error) {
    console.error('Error🥹', error);
    return null;
      }
    }

    api.setMessageReaction("😘", event.messageID, () => {}, true);
    const query = args.join(' ');

    if (!query) {
    api.sendMessage({ body: "Please provide a search query." }, event.threadID, event.messageID);
    return;
    }

    const modifiedQuery = `${query} anime edit`;
    const response = await fetchTikTokVideos(modifiedQuery);

    if (!response || !response.videoUrl) {
    api.sendMessage({ body: `No video found for query: ${query}.` }, event.threadID, event.messageID);
    return;
    }

    const title = response.title || "No title available";
    const videoUrl = response.videoUrl;

    try {
    const videoStream = await axios.get(videoUrl, { responseType: 'stream' });
    api.sendMessage({
    body: `𝐍𝐚𝐰 𝐛𝐚𝐛𝐲 𝐞𝐝𝐢𝐭𝐳 𝐯𝐢𝐝𝐞𝐨 <😘`,
    attachment: videoStream.data,
    }, event.threadID, event.messageID);
   } catch (error) {
    console.error(error);
    api.sendMessage({ body: 'error Please try again later.' }, event.threadID, event.messageID);
    }
  },
};
