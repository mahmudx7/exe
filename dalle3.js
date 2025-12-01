const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "dalle3",
  version: "1.7",
  role: 0,
  author: "MahMUD",
  category: "Image gen",
  guide: "{pn} [prompt]",
  countDown: 10
};

module.exports.onStart = async ({ api, event, args }) => {
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("❌ Please provide a prompt.", event.threadID, event.messageID);

  try {
    const wait = await api.sendMessage("🎨 Generating image, please wait...", event.threadID);
    const res = await axios.post(`${await baseApiUrl()}/api/dalle3`, { prompt });
    const imageUrl = res.data.imageUrl;
    const imgRes = await axios.get(imageUrl, { responseType: "stream" });

    api.unsendMessage(wait.messageID);
    api.sendMessage(
      {
        body: "✨ | Here's your image",
        attachment: imgRes.data
      },
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error("Dalle3 Error:", err.response?.data || err.message);
    api.sendMessage("❌ Failed to generate image.", event.threadID, event.messageID);
  }
};
