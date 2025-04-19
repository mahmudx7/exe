const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "time",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "utility",
    guide: "{pn} [country] | {pn} list\n\nExamples:\n{pn} bangladesh\n{pn} london\n{pn} list"
  },

  onStart: async function ({ message, args }) {
    const country = args[0]?.toLowerCase() || "bangladesh";

    try {
      const baseUrl = await baseApiUrl();

      const response = await axios.get(`${baseUrl}/time/${country}`, {
      headers: { "author": module.exports.config.author }
      });

      return response.data.message
     ? message.reply(response.data.message)
     : message.reply("⚠️ Unable to fetch time.");
    } catch (error) {
      return message.reply("An error occurred. Please try again later.");
    }
  }
};
