const axios = require("axios");

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

      await message.reply({ body: "Here is your couple DP!", attachment: attachments });

    } catch (error) {
      console.error(error);
      message.reply("Error fetching couple DP. Please try again later.");
    }
  }
};
