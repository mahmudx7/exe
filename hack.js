const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmhd = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "hack",
    author: "MahMUD",
    version: "1.7",
    role: 0,
    countDown: 5,
    category: "fun",
    guide: { en: "{p}hack @user | {p}hack <facebookId> | {p}hack (reply)" }
  },

  onStart: async function ({ args, api, event }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to change the author name.",
        event.threadID,
        event.messageID
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const outPath = path.join(cacheDir, `hack_${Date.now()}.png`);

    try {
      let targetId = event.senderID;
      if (event.mentions && Object.keys(event.mentions).length) {
        targetId = Object.keys(event.mentions)[0];
      } else if (event.messageReply && event.messageReply.senderID) {
        targetId = event.messageReply.senderID;
      } else if (args && args[0] && /^\d+$/.test(args[0])) {
        targetId = args[0].trim();
      }

      let displayName = null;

      if (event.mentions && event.mentions[targetId]) {
        displayName = event.mentions[targetId];
      }

      try {
        const info = await api.getUserInfo([targetId]);
        if (info && info[targetId] && info[targetId].name) {
          displayName = info[targetId].name;
        }
      } catch (e) {}

      if (!displayName) {
        if (event.messageReply && event.messageReply.senderName) displayName = event.messageReply.senderName;
        else if (event.senderName) displayName = event.senderName;
        else displayName = targetId;
      }

      const baseApi = await mahmhd();
      const apiUrl = `${baseApi}/api/hack?id=${encodeURIComponent(targetId)}&name=${encodeURIComponent(displayName)}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 20000 });
      await fs.writeFile(outPath, Buffer.from(res.data));

      const bodyText = `✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙃𝙖𝙘𝙠𝙚𝙙 𝙏𝙝𝙞𝙨 𝙐𝙨𝙚𝙧: ${displayName}`;
      api.sendMessage(
        { body: bodyText, attachment: fs.createReadStream(outPath) },
        event.threadID,
        () => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {} },
        event.messageID
      );
    } catch (err) {
      try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
    }
  }
};
