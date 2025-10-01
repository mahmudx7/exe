const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image gen",
    guide: { en: "{pn} query - amount\nExample: {pn} goku ultra - 10" }
  },

  onStart: async function ({ api, event, args, message }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.\n",
        event.threadID,
        event.messageID
      );
    }

    try {
      const queryAndLength = args.join(" ").split("-");
      const keySearch = queryAndLength[0]?.trim();
      const count = queryAndLength[1]?.trim();
      const numberSearch = count ? Math.min(parseInt(count), 20) : 6;

      if (!keySearch) return message.reply("❌ | Please enter a search query.\nExample: goku ultra - 10");

      const apiUrl = await mahmud();
      const response = await axios.get(
        `${apiUrl}/api/pin?query=${encodeURIComponent(keySearch)}&limit=${numberSearch}`
      );

      const data = response.data.images;
      if (!data || data.length === 0) return message.reply("❌ | No images found for your query.");

      const attachments = [];
      for (let i = 0; i < data.length; i++) {
        const imgUrl = data[i];
        const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
        const imgPath = path.join(__dirname, `temp_pin_${Date.now()}_${i}.jpg`);
        await fs.outputFile(imgPath, imgRes.data);
        attachments.push(fs.createReadStream(imgPath));
      }

      await message.reply({ body: `✅ | Here are your ${attachments.length} images for "${keySearch}"`, attachment: attachments });
      attachments.forEach(att => fs.unlink(att.path, () => {}));

    } catch (err) {
      console.error(err);
      return message.reply(`🥹error, contact MahMUD`);
    }
  }
};
