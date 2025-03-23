const fetch = require('node-fetch');

require("axios");
const fs = require("fs");
const baseApiUrl = async () => {
  const base = 'https://mahmud-age.onrender.com';
  return base;
};
module.exports = {
    config: {
        name: "age",
        version: "1.7",
        author: "leon",
        category: "utility",
        guide: {
            en: "Usage: age <YYYY-MM-DD>"
        }
    },

    onStart: async function ({ args, message }) {
        if (args.length === 0) {
            return message.reply("❗ Please provide your date of birth in the format `YYYY-MM-DD`.");
        }

        const inputDate = args[0];

        try {
            const apiUrl = await baseApiUrl();
      const response = await axios.get(`$/age/font3/${inputDate}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.error) {
                return message.reply(data.error);
            }

            return message.reply(data.message);

        } catch (error) {
            return message.reply("❌ Error connecting to the age calculator API.");
        }
    }
};
