const axios = require('axios');

module.exports = {
  config: {
    name: "time",
    version: "1.7",
    author: "MahMUD",
    countDown: 2,
    role: 0,
    longDescription: "Fetch the current time in different countries.",
    category: "utility",
    guide: "{pn} [country] | {pn} list\n\nExamples:\n{pn} bangladesh\n{pn} london\n{pn} list"
  },

  onStart: async function ({ message, args }) {
    let country = args[0]?.toLowerCase() || "bangladesh";

    if (country === 'list') {
      try {
        const response = await axios.get('https://mahmud-time.onrender.com/time/list', {
          headers: { "author": module.exports.config.author }
        });

        return response.data.message 
          ? message.reply(response.data.message) 
          : message.reply("⚠️ Unable to fetch country list.");
      } catch (error) {
        return message.reply("⚠️ An error occurred. Please try again later.");
      }
    }

    try {
      const response = await axios.get(`https://mahmud-time.onrender.com/time/${country}`, {
        headers: { "author": module.exports.config.author }
      });

      return response.data.error 
        ? message.reply(response.data.error) 
        : message.reply(response.data.message);
    } catch (error) {
      return message.reply("⚠️ An error occurred. Please try again later.");
    }
  }
};
