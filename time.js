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
    const country = args[0]?.toLowerCase() || 'bangladesh';

     if (country === 'list') {
     return message.reply(
    `⚠️ Use the API at https://mahmud-time.onrender.com/time/list to see the available countries.`
      );
    }

    try {
      const response = await axios.get(`https://mahmud-time.onrender.com/time/${country}`);
      message.reply(response.data.message);
    } catch (error) {
      message.reply(`⚠️ An error occurred. Please try again later.`);
    }
  }
};
