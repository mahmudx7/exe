const axios = require("axios");
const baseApiUrl = async () => "https://mahmud-cdp.onrender.com";

module.exports = {
	config: {
		name: "copuledp",
		aliases: ["cdp"],
		version: "1.7",
		author: "MahMUD",
		countDown: 2,
		role: 0,
		longDescription: "random couple DP for nibba and nibbi",
		category: "image",
		guide: "{pn}"
	}, 

	onStart: async function ({ message }) {
		try {
			const base = await baseApiUrl();
			const response = await axios.get(`${base}/dp`);

			const { message: apiMessage, male, female } = response.data;

			if (!male || !female) {
				return message.reply("Couldn't fetch couple DP. Try again later.");
			}

			let attachments = [];
			attachments.push(await global.utils.getStreamFromURL(male));
			attachments.push(await global.utils.getStreamFromURL(female));

			const sentMessage = await message.reply({
				body: `${apiMessage} (Message ID: ${message.messageID})`,
				attachment: attachments
			});

		} catch (error) {
			console.error("Error details:", error.response ? error.response.data : error.message);
			message.reply("Error fetching couple DP. Please try again later.");
		}
	}
};
