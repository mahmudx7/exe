const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "gpt",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: "{pn} <question>"
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length && !(event.type === "message_reply" && event.messageReply.attachments.length > 0)) {
      return api.sendMessage("Please provide a question.", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    const apiUrl = `${await baseApiUrl()}/api/gpt`;

    const requestBody = {
      question: query,
      contents: [
        {
          parts: [{ text: query }]
        }
      ]
    };

    // Handle image reply
    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const imageUrl = event.messageReply.attachments[0].url;
      try {
        const base64Image = await getImageBase64(imageUrl);
        requestBody.contents[0].parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Image },
        });
      } catch (err) {
        return api.sendMessage("Failed to process image.", event.threadID, event.messageID);
      }
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "author": module.exports.config.author
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.error) {
        return api.sendMessage(data.error, event.threadID, event.messageID);
      }

      api.sendMessage(data.response || "Sorry, I couldn't generate a response.", event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("An error occurred while fetching the AI response.", event.threadID, event.messageID);
    }
  }
};
