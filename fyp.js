const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "fyp",
    version: "1.7",
    author: "MahMUD",
    category: "media",
    countDown: 5,
    role: 0
  },

  onStart: async ({ api, event, args }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    try {
      const keyword = args.join(" ");
      if (!keyword) { return api.sendMessage("❌ | Use:\nfyp goku edit video.",
      event.threadID, event.messageID);
     }

      const baseUrl = await baseApiUrl();
      const apiUrl = `${baseUrl}/api/fyp?keyword=${encodeURIComponent(keyword)}`;
      const res = await axios.get(apiUrl);
      if (!res.data?.videoUrl) { return api.sendMessage("No video found!",
      event.threadID, event.messageID);
     }

      const filePath = path.join( __dirname, `/cache/fyp_${Date.now()}.mp4` );
      const videoRes = await axios.get(res.data.videoUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(filePath);
      videoRes.data.pipe(writer);

      writer.on("finish", () => { api.sendMessage({
      body: `🎥 TikTok FYP\n\n` + `📝 Title: ${res.data.title || "Unknown"}\n` + `👤 Author: ${res.data.author?.nickname || "Unknown"}`, attachment: fs.createReadStream(filePath)  }, event.threadID, event.messageID);
      setTimeout(() => fs.unlinkSync(filePath), 5000);
      });

      writer.on("error", () => { api.sendMessage( "Video save failed!",
      event.threadID, event.messageID );});

    } catch (e) {
      console.error(e);
      api.sendMessage( "🥺error, contact MahMUD.",
        event.threadID,
        event.messageID
      );
    }
  }
};
