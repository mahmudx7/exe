const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
  config: {
    name: "unsplash",
    aliases: ["uph"],
    version: "1.7",
    author: "MahMUD",
    category: "media",
    guide: "Example: {pn} cat - 10"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) return api.sendMessage("Wrong use baby\nExample: {pn} cat - 10", event.threadID, event.messageID);
      
      const [keySearchs, numberSearch] = keySearch.split("-").map(val => val.trim());
      const limit = Math.min(20, parseInt(numberSearch) || 6);
      const apiUrl = `https://mahmud-unsplash-api.onrender.com/img?query=${encodeURIComponent(keySearchs)}&number=${limit}`;
      
      const { data } = await axios.get(apiUrl, {
        headers: {
          "author": module.exports.config.author
        }
      });
      
      const imgData = [];
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      
      for (let i = 0; i < limit; i++) {
        const imgUrl = data.images[i];
        const imgResponse = await axios.get(imgUrl, { responseType: "arraybuffer" });
        const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
        await fs.promises.writeFile(imgPath, imgResponse.data, 'binary');
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({ body: "✅ Here your unsplash images:", attachment: imgData }, event.threadID, event.messageID);
      fs.existsSync(cacheDir) && await fs.promises.rm(cacheDir, { recursive: true });

    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
