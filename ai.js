const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "ai",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage("Please provide a question", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiUrl = `${await mahmud()}/api/ai`;

    try {
      const response = await axios.post(
        apiUrl,
        { question: query },
        {
          headers: {
            "Content-Type": "application/json",
            "author": module.exports.config.author
          }
        }
      );

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      api.sendMessage(response.data.response || "Sorry, I couldn't generate a response.", event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("An error occurred while fetching the AI response.", event.threadID, event.messageID);
    }
  }
};
