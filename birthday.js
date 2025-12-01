const axios = require("axios");

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
    name: "birthday",
    aliases: ["wish"],
    version: "1.7",
    role: 0,
    author: "MahMUD",
    category: "love",
    countDown: 5,
    guide: { en: "{p}{n} @mention" },
  },

  onStart: async function ({ api, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return api.sendMessage("❌ You need to tag someone to wish!", event.threadID, event.messageID);
    }

    const taggedUserName = event.mentions[mention[0]].replace('@', '');

    try {
      const baseApi = await mahmhd();
      const apiUrl = `${baseApi}/api/wish/font3?taggedUserName=${encodeURIComponent(taggedUserName)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === "success") {
        api.sendMessage(data.response, event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ Failed to send the birthday wish. Please try again later.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage(`❌ Something went wrong: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
