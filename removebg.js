const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "removebg",
    aliases: ["rmbg", "rbg"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "media",
    guide: "{pn} [Reply to image]",
  },

  onStart: async function ({ message, event }) {
    try {
      if (event.type !== "message_reply")
        return message.reply("❌ | Please reply to an image.");

      if (!event.messageReply.attachments || event.messageReply.attachments[0].type !== "photo")
        return message.reply("No image found, reply to an image.");

      const imageUrl = event.messageReply.attachments[0].url;
      const apiUrl = await mahmud();

      const response = await axios.post(
        `${apiUrl}/api/rmbg`,
        { imageUrl },
        { responseType: "stream" }
      );

      const outputPath = path.resolve(__dirname, "cache", `${Date.now()}_rmbg.png`);
      const writer = fs.createWriteStream(outputPath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply({ attachment: fs.createReadStream(outputPath) }).then(() => fs.unlinkSync(outputPath));
      });

      writer.on("error", (err) => {
        console.error("Error saving image:", err);
        message.reply("Error occurred while saving the image.");
      });
    } catch (error) {
      console.error("Error calling API:", error);
      message.reply("An error occurred while contacting the API.");
    }
  },
};
