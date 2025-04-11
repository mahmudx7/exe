const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.age;
};

module.exports = {
    config: {
        name: "age",
        version: "1.7",
        author: "MahMUD",
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
            const response = await axios.get(`${await baseApiUrl()}/age/font3/${inputDate}`);
            const data = response.data;

            if (data.error) {
                return message.reply(data.error);
            }

            return message.reply(data.message);

        } catch (error) {
            return message.reply("❌ Error connecting to the age calculator API.");
        }
    }
};
