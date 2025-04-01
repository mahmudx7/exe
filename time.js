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
    const country = args[0]?.toLowerCase();

    if (country === 'list') {
      try {
        const response = await axios.get('https://mahmud-time.onrender.com/time/list', {
          headers: { "author": module.exports.config.author }
        });

        if (response.data.message) {
          return message.reply(response.data.message);
        } else {
          return message.reply("⚠️ Unable to fetch country list.");
        }
      } catch (error) {
        message.reply(`⚠️ An error occurred. Please try again later.`);
      }
    }

    try {
      const response = await axios.get(`https://mahmud-time.onrender.com/time/${country}`, {
        headers: { "author": module.exports.config.author }
      });

      if (response.data.error) {
        return message.reply(response.data.error);
      }

      message.reply(response.data.message);
    } catch (error) {
      message.reply(`⚠️ An error occurred. Please try again later.`);
    }
  }
};
