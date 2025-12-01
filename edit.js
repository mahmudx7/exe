const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "edit",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    guide: { en: "{p}edit [prompt] reply to image" }
  },

  onStart: async function ({ api, event, args, message }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return message.reply("❌ | You are not authorized to change the author name.");
    }

    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("🐤 | Please reply to a photo with your prompt to edit it.");
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const imgPath = path.join(cacheDir, `${Date.now()}_edit.jpg`);
    const waitMsg = await message.reply("🪄 | Editing your image, please wait...");

    try {
      const baseURL = await mahmud();
      const res = await axios.post(
        `${baseURL}/api/edit`,
        { prompt, imageUrl: repliedImage.url },
        { responseType: "arraybuffer" }
      );

      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `✅ | Edited image for: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });
    } catch (err) {
      console.error(err);
      message.reply("🥹 error baby, Please try again later.");
    } finally {
      setTimeout(() => fs.remove(imgPath).catch(() => {}), 10000);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    }
  }
};
