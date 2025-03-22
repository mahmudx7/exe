const fetch = require('node-fetch');

module.exports = {
    config: {
        name: "age",
        version: "1.2",
        author: "RL",
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
            const response = await fetch(`https://mahmud-age.onrender.com/age/font3/${inputDate}`, {
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
