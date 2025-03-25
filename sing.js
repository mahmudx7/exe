const axios = require("axios");

const baseApiUrl = async () => {
  const base = 'https://mahmud-sing.onrender.com';
  return base;
};

module.exports = {
    config: {
        name: "sing",
        version: "1.7",
        author: "MahMUD", 
        countDown: 10,
        role: 0,
        category: "music",
        guide: "{p}sing [query]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length === 0) {
            return message.reply("❌ | Please provide a sing name janu.");
        }

        try {
            const query = encodeURIComponent(args.join(" "));
            const apiUrl = `${await baseApiUrl()}/sing?query=${query}`;

            message.reply("⏳ Fetching your song...");

            const response = await axios.get(apiUrl, {
                responseType: "stream",
                headers: { "author": module.exports.config.author }
            });

            console.log("Response:", response);  // Log response to check if it has data

            if (response.data.error) {
                return message.reply(`❌ Error: ${response.data.error}`);
            }

            message.reply({
                body: `✅ Here's your song: ${args.join(" ")}`,
                attachment: response.data
            });

        } catch (error) {
            console.error("Error:", error.message);

            if (error.response) {
                console.error("Response error data:", error.response.data);
                console.error("Response status:", error.response.status);
                return message.reply(`❌ Error: ${error.response.data.error || error.message}`);
            }

            message.reply("❌ An error occurred while processing your request.");
        }
    }
};
