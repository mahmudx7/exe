const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "1.7",
    author: "MahMUD",
    category: "ai",
    guide: {
      en: "{pn} reply with an image",
    },
  },

  onStart: async function ({ api, args, event }) {
    const apiUrl = `${await baseApiUrl()}/api/prompt`;
    let prompt = args.join(" ") || "Describe this image";

    if (event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo") {
    try {
    const response = await axios.post(apiUrl, {
    imageUrl: event.messageReply.attachments[0].url,
    prompt
    }, {
    headers: { "Content-Type": "application/json", "author": module.exports.config.author }
    });
    const reply = response.data.error || response.data.response || "No response";
    api.sendMessage(reply, event.threadID, event.messageID);
    return api.setMessageReaction("🪽", event.messageID, () => {}, true);

  } catch (error) {
    api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
    return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    }

    api.sendMessage("Please reply with an image.", event.threadID, event.messageID);
  }
};
