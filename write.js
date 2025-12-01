const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmhd = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "write",
    aliases: ["wr"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: { en: "Write text on a replied image using remote API" },
    guide: { en: "{p}write [color] - <text>\nReply to an image to use this command.\nUse '{p}write list' to see available colors." }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;    
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "❌ | You are not authorized to use this command.",
        threadID,
        messageID
      );
    }

    const colorMap = {
      b: "black",
      w: "white",
      r: "red",
      bl: "blue",
      g: "green",
      y: "yellow",
      o: "orange",
      p: "purple",
      pk: "pink"
    };

    if (args[0]?.toLowerCase() === "list") {
      return api.sendMessage(
        `🎨 Available colors:\n${Object.entries(colorMap)
          .map(([short, full]) => `${short} → ${full}`)
          .join("\n")}\n\nDefault is white if not specified.`,
        threadID,
        messageID
      );
    }

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0].url) {
      return api.sendMessage("Please reply to an image.", threadID, messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;
    let input = args.join(" ").trim();
    let color = "white";
    let text = input;

    if (input.includes(" - ")) {
      [color, text] = input.split(" - ").map(i => i.trim());
      color = colorMap[color.toLowerCase()] || "white";
    }

    if (!text) return api.sendMessage("Please provide text to write.", threadID, messageID);

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const tempPath = path.join(cacheDir, `write_${Date.now()}.png`);

    try {
      const baseApi = await mahmhd();
      if (!baseApi) return api.sendMessage("⚠️ | Remote API unavailable — try again later.", threadID, messageID);

      const apiUrl = `${baseApi}/api/write?imageUrl=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(text)}&color=${encodeURIComponent(color)}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 20000 });

      await fs.writeFile(tempPath, Buffer.from(response.data));

      await api.sendMessage(
        { attachment: fs.createReadStream(tempPath) },
        threadID,
        () => { try { fs.existsSync(tempPath) && fs.unlinkSync(tempPath); } catch {} },
        messageID
      );
    } catch {
      try { fs.existsSync(tempPath) && fs.unlinkSync(tempPath); } catch {}
      api.sendMessage("🥹error, contact MahMUD", threadID, messageID);
    }
  }
};
