const axios = require("axios");

const baseApiUrl = async () => {
  return 'https://mahmud-namaz.onrender.com';
};

module.exports = {
  config: {
    name: "namaz",
    aliases: ["prayer", "salah"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "Islamic",
    guide: "{pn} <city>\n\n- {pn}: <city> Example: {pn} Dhaka"
  },

  onStart: async function ({ message, args }) {
    const city = args.join(" ") || "Dhaka";
    const apiUrl = `${await baseApiUrl()}/font3/${encodeURIComponent(city)}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: { "author": module.exports.config.author }
      });

      if (response.data.error) {
        return message.reply(`❌ ${response.data.error}`);
      }

      if (response.data && response.data.message) {
        message.reply(response.data.message);
      } else {
        message.reply(`❌ No prayer times available for ${city}. Please try again later.`);
      }
    } catch (error) {
      console.error(error);

      if (error.response) {
        return message.reply(`❌ API Error: ${error.response.data.error || "Unknown error."}`);
      } else if (error.request) {
        return message.reply(`❌ No response from API. Please check the API status.`);
      } else {
        return message.reply(`❌ Error fetching prayer times. Please try again later.`);
      }
    }
  }
};
