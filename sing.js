const axios = require("axios");

module.exports = {
    config: {
        name: "sing",
        version: "1.0",
        author: "MahMUD", 
        countDown: 10,
        role: 0,
        shortDescription: "Download and send audio from YouTube.",
        longDescription: "Fetch audio from YouTube using an API and send it as an attachment.",
        category: "music",
        guide: "{p}sing [query]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length === 0) {
            return message.reply("❌ | Please provide a sing name janu.");
        }

        try {
            const query = encodeURIComponent(args.join(" "));
            const apiUrl = `https://mahmud-sing.onrender.com/sing?query=${query}`;

            message.reply("⏳ Fetching your song...");

            const response = await axios.get(apiUrl, {
                responseType: "stream",
                headers: { "author": module.exports.config.author }
            });

            if (response.data.error) {
                return message.reply(`❌ Error: ${response.data.error}`);
            }

            message.reply({
                body: `✅ Here's your song: ${args.join(" ")}`,
                attachment: response.data
            });

        } catch (error) {
            console.error("Error:", error.message);

            if (error.response && error.response.data && error.response.data.error) {
                return message.reply(`❌ Error: ${error.response.data.error}`);
            }

            message.reply("❌ An error occurred while processing your request.");
        }
    }
};
