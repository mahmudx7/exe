const axios = require("axios");
const path = require("path");
const fs = require("fs");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

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
      const input = args.join(" ");
      if (!input.includes("-")) return api.sendMessage("❌ Usage: {pn} cat - 10", event.threadID, event.messageID);

      const [query, number] = input.split("-").map(x => x.trim());
      const limit = Math.min(20, parseInt(number) || 6);

      const apiBase = await mahmud();
      const apiUrl = `${apiBase}/api/unsplash?query=${encodeURIComponent(query)}&number=${limit}`;

      const { data } = await axios.get(apiUrl, {
        headers: { author: module.exports.config.author }
      });

      if (!data.images?.length) return api.sendMessage("❌ No images found.", event.threadID, event.messageID);

      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache)) fs.mkdirSync(cache);

      const files = await Promise.all(data.images.map(async (url, i) => {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        const file = path.join(cache, `${i + 1}.jpg`);
        await fs.promises.writeFile(file, img.data);
        return fs.createReadStream(file);
      }));

      await api.sendMessage({ body: "✅ Here your unsplash images:", attachment: files }, event.threadID, event.messageID);
      fs.rmSync(cache, { recursive: true, force: true });

    } catch (e) {
      api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }
};
