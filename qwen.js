! Cmd2 install qwen.js const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "qwen",
    version: "1.0",
    author: "MahMUD",
    countDown: 5,
    role: 2,
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) return api.sendMessage("Please provide a prompt.", event.threadID, event.messageID);

    const query = encodeURIComponent(args.join(" "));
    const apiUrl = `${await mahmud()}/api/qwen?prompt=${query}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.response || "No response received.";

      api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error(error.message);
      api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
    }
  }
};
