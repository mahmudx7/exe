const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
    config: {
        name: "sing",
        version: "1.7",
        author: "MahMUD", 
        countDown: 10,
        role: 0,
        category: "music",
        guide: "{p}sing [song name]"
    },

    onStart: async function ({ api, event, args, message }) {
        if (args.length === 0) {
            return message.reply("❌ | Please provide a song name\n\nExample: sing mood lofi");
        }

        try {
            const query = encodeURIComponent(args.join(" "));
            const apiUrl = `${await mahmud()}/api/sing2?songName=${query}`;

            const response = await axios.get(apiUrl, {
                responseType: "stream",
                headers: { "author": module.exports.config.author }
            });

            if (response.data.error) {
                return message.reply(`${response.data.error}`);
            }

            message.reply({
                body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐬𝐨𝐧𝐠: ${args.join(" ")}`,
                attachment: response.data
            });

        } catch (error) {
            console.error("Error:", error.message);

            if (error.response) {
                console.error("Response error data:", error.response.data);
                console.error("Response status:", error.response.status);
                return message.reply(`${error.response.data.error || error.message}`);
            }

            message.reply("error🥺");
        }
    }
};
