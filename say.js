const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "say",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "media",
    guide: "{pn} <text> (or reply to a message)",
  },

  onStart: async function ({ api, message, args, event }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);  if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    let text = args.join(" ");

    if (event.type === "message_reply" && event.messageReply.body) {
      text = event.messageReply.body;
    }

    if (!text) {
      return message.reply("⚠️ দয়া করে কিছু লিখুন বা একটি মেসেজে রিপ্লাই দিন!");
    }

    try {
      const baseUrl = await baseApiUrl();
      const response = await axios.get(`${baseUrl}/api/say`, {
        params: { text },
        headers: { "Author": module.exports.config.author },
        responseType: "stream",
      });

      if (response.data.error) {
        return message.reply(`${response.data.error}`);
      }

      message.reply({
        body: "",
        attachment: response.data,
      });

    } catch (e) {
      console.error("API Error:", e.response ? e.response.data : e.message);
      message.reply("🥹error, contact MahMUD.\n" + (e.response?.data?.error || e.message));
    }
  },
};
