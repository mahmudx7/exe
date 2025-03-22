const axios = require("axios");

const baseApiUrl = async () => {
  const base = 'https://mahmud-namaz.onrender.com';
  return base;
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
      const response = await axios.get(apiUrl);
      
      if (response.data && response.data.message) {
        const msg = response.data.message;
        message.reply(msg);
      } else {
        message.reply(`❌ No prayer times available for ${city}. Please try again later.`);
      }
      
    } catch (error) {
      console.error(error);
      message.reply(`❌ Error fetching prayer times for ${city}. Please make sure the city name is correct or try again later.`);
    }
  }
};
