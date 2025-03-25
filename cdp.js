const axios = require("axios");

const baseApiUrl = async () => {
const base = await axios.get(
`https://raw.githubusercontent.com/mahmudx7/exe/main/APIRUL.json',
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "copuledp",
    aliases: ["cdp"],
    version: "1.7",
    author: "MahMUD",
    countDown: 2,
    role: 0,
    longDescription: "Fetch a random couple DP for nibba and nibbi",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const response = await axios.get("https://mahmud-cdp.onrender.com/dp", {
        headers: { "author": module.exports.config.author }
      });

      if (response.data.error) return message.reply(response.data.error);

      const { male, female } = response.data;
      if (!male || !female) return message.reply("Couldn't fetch couple DP. Try again later.");

      let attachments = [
        await global.utils.getStreamFromURL(male),
        await global.utils.getStreamFromURL(female)
      ];

      await message.reply({ body: response.data.message, attachment: attachments });

    } catch (error) {
      message.reply(error.response?.data?.error || "Error fetching couple DP. Please try again later.");
    }
  }
};
