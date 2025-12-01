const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "karaba",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "karaba [mention/reply/UID]",
  },

  onStart: async function ({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77,97,104,77,85,68);
    if (module.exports.config.author !== obfuscatedAuthor)
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);

    const { threadID, messageID, messageReply, mentions } = event;
    let id2 = messageReply?.senderID || Object.keys(mentions)[0] || args[0];
    if (!id2) return api.sendMessage("Mention, reply, or provide UID of the target.", threadID, messageID);

    try {
      const url = `${await baseApiUrl()}/api/dig?type=karaba&user=${id2}`;
      const img = await axios.get(url, { responseType: "arraybuffer" });
      const file = path.join(__dirname, `karaba_${id2}.png`);
      fs.writeFileSync(file, img.data);

      api.sendMessage({
        body: "Effect karaba successful 🔥",
        attachment: fs.createReadStream(file)
      }, threadID, () => fs.unlinkSync(file), messageID);

    } catch {
      api.sendMessage("🥹 Error, contact MahMUD.", threadID, messageID);
    }
  }
};
