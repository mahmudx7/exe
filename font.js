const axios = require("axios");

const baseApiUrl = async () => {
  const base = 'https://mahmud-style.onrender.com';
  return base;
};

module.exports.config = {
  name: "style",
  aliases: ["font"],
  version: "1.7",
  role: 0,
  countDowns: 5,
  author: "MahMUD",
  category: "general",
  guide: { en: "[number] [text]" }
};

module.exports.onStart = async function ({ message, args }) {
  if (args[0] === "list") {
    try {
      const response = await axios.get(`${await baseApiUrl()}/font/list`);
      let fontList = response.data;
      if (!fontList) return message.reply("No font styles found or the response format is incorrect.");
      fontList = fontList.replace("Available Font Styles:", "").trim();
      let fontStyles = "Available Font Styles:\n";
      fontList.split("\n").forEach((line) => { fontStyles += `${line.trim()}\n`; });
      await message.reply(fontStyles);
      return;
    } catch (error) {
      console.error("Error fetching font list:", error);
      await message.reply("Sorry, an error occurred while fetching the font styles.");
    }
  }

  const number = args[0];
  const text = args.slice(1).join(" ");

  if (!text || isNaN(number)) {
    return message.reply("Invalid command. Usage: style <number> <text>");
  }

  try {
    const response = await axios.post(`${await baseApiUrl()}/font`, {
      number: number,
      text: text
    });

    const fontData = response.data.data;
    const fontStyle = fontData[number];

    if (!fontStyle) {
      return message.reply(`Font style ${number} does not exist. Please choose a valid font number.`);
    }

    let convertedText = "";
    for (const char of text) {
      if (fontStyle[char]) {
        convertedText += fontStyle[char];
      } else {
        convertedText += char;
      }
    }

    if (!convertedText) {
      return message.reply("Error: Could not convert the text with the specified style.");
    }

    await message.reply(convertedText);
  } catch (error) {
    console.error("Error sending data to the API:", error);

    if (error.response) {
      console.error("API Error Response:", error.response.data);
      await message.reply(`API Error: ${error.response.data.message || "An unknown error occurred."}`);
    } else {
      await message.reply("Sorry, an error occurred while processing your request.");
    }
  }
};
