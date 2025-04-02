const axios = require("axios");
const fs = require("fs");

module.exports = {
    config: {
        name: "emojimix",
        aliases: ["mix"],
	version: "1.7",
        author: "MahMUD",
        countDown: 5,
        role: 0,
        guide: "{pn} <emoji1> <emoji2>\n Example: {pn} 🙂 😘",
        category: "fun"
    },

    langs: {
        en: {
            error: "Sorry, emoji %1 and %2 can't mix",
            success: "Emoji %1 and %2 mixed successfully!"
        }
    },

    onStart: async function ({ message, args, getLang }) {
        const emoji1 = args[0];
        const emoji2 = args[1];

        if (!emoji1 || !emoji2) return message.SyntaxError();

        const image = await generateEmojimix(emoji1, emoji2);
        if (!image) return message.reply(getLang("error", emoji1, emoji2));

        message.reply({
            body: getLang("success", emoji1, emoji2),
            attachment: image
        });
    }
};

async function baseApiUrl() {
    const base = 'https://mahmud-emojimix.onrender.com';
    return base;
}

async function generateEmojimix(emoji1, emoji2) {
    try {
        const apiUrl = `${await baseApiUrl()}/mix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
        const { data: response } = await axios.get(apiUrl, { responseType: "stream" });

        response.path = `emojimix_${Date.now()}.png`;
        return response;
    } catch (error) {
        return null;
    }
}
