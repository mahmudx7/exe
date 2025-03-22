const axios = require("axios");

module.exports = {
  config: {
    name: "namaz",
    aliases: ["prayer", "salah"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "Islamic",
    guide: "{pn} <city>\n\n- {pn}: Command prefix (e.g., ! or ?)\n- <city>: Name of the city for which you want the prayer times. If no city is provided, the default city is 'Dhaka'. Example: `{pn} Dhaka`"
  },

  onStart: async function ({ message, args }) {
    const city = args.join(" ") || "Dhaka";
    const apiUrl = `https://mahmud-namaz.onrender.com/font3/${encodeURIComponent(city)}`;

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
