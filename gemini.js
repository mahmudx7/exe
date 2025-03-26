const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    version: "1.2",
    author: "MahMUD",
    description: "Ask Gemini AI anything",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: {
      en: "{pn} message | reply with an image",
    },
  },

  onStart: async function ({ api, args, event }) {
    const apiUrl = "https://mahmud-geminii.onrender.com/gemini"; // Replace with your API URL
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage(
        "Please provide a question to answer.\n\nExample:\n{pn} What is AI?",
        event.threadID,
        event.messageID
      );
    }

    let requestBody = { prompt };

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        requestBody.imageUrl = attachment.url;
      }
    }

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: { 
          "Content-Type": "application/json",
          "author": module.exports.config.author // Authorization Header
        }
      });

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      const replyText = response.data.response || "No response received.";

      api.sendMessage({ body: replyText }, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: replyText,
          });
        }
      }, event.messageID);
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, args, event, Reply }) {
    if (Reply.author !== event.senderID) return;

    const apiUrl = "https://mahmud-geminii.onrender.com/gemini"; // Replace with your API URL
    const prompt = args.join(" ");

    if (!prompt) return;

    try {
      const response = await axios.post(apiUrl, { prompt }, {
        headers: { 
          "Content-Type": "application/json",
          "author": module.exports.config.author // Authorization Header
        }
      });

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      const replyText = response.data.response || "No response received.";

      api.sendMessage({ body: replyText }, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: replyText,
          });
        }
      }, event.messageID);
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
    }
  }
};
