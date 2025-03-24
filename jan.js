const axios = require("axios");
const baseApiUrl = async () => "https://mahmud-x8mi.onrender.com";

module.exports = {
  config: {
    name: "bot2",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "ai",
    guide: {
     en: "type jan"
    },
  },

  onStart: async function () {},
    removePrefix: function (str, prefixes) {
    for (const prefix of prefixes) {
    if (str.startsWith(prefix)) {
    return str.slice(prefix.length).trim();
      }
    }
    return str;
  },

  getBotResponse: async function (message) {
    try {
      const base = await baseApiUrl();
      const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(message)}`);
      return response.data?.message || "error try Again later";
    } catch (error) {
      console.error("API Error:", error.message || error);
      return "error try Again later";
    }
  },

  onReply: async function ({ api, event }) {
      if (event.type === "message_reply") {
      let message = event.body.toLowerCase();
      message = this.removePrefix(message, ["jan"]) || "opp2";
   
      if (message) {
      const replyMessage = await this.getBotResponse(message);
      api.sendMessage(replyMessage, event.threadID, (err, info) => {
      if (!err) {
      
       global.GoatBot.onReply.set(info.messageID, {
       commandName: "bot2",
       type: "reply",
       messageID: info.messageID,
       author: event.senderID,
       text: replyMessage,
            });
          }
        }, event.messageID);
      }
    }
  },

  onChat: async function ({ api, event }) {
    const responses = [
      "babu khuda lagse🥺",
      "Hop beda😾, Boss বল boss😼",
      "আমাকে ডাকলে, আমি কিন্তূ কিস করে দেবো😘",
      "🐒🐒🐒",
      "bye",
      "naw message daw m.me/mahmud.x07",
      "mb ney bye",
      "meww",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
    ];

     let message = event.body ? event.body.toLowerCase() : "";
     const words = message.split(" ");
     const wordCount = words.length;

     if (event.type !== "message_reply" && message.startsWith("jan")) {
     api.setMessageReaction("😍", event.messageID, () => {}, true);
     api.sendTypingIndicator(event.threadID, true);

     if (wordCount === 1) {
     api.sendMessage({ body: responses[Math.floor(Math.random() * responses.length)] }, event.threadID, (err, info) => {
     if (!err) {
  
      global.GoatBot.onReply.set(info.messageID, {
      commandName: "bot2",
      type: "reply",
      messageID: info.messageID,
      author: event.senderID,
      link: responses[Math.floor(Math.random() * responses.length)],
            });
          }
    }, event.messageID);
     } else {
       words.shift();
       const userText = words.join(" ");
        
     try {
       const base = await baseApiUrl();
       const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(userText)}`);
       const botResponse = response.data?.message || "error try Again later";
          
         api.sendMessage(botResponse, event.threadID, (err, info) => {
         if (!err) {
         global.GoatBot.onReply.set(info.messageID, {
         commandName: "bot2",
         type: "reply",
         messageID: info.messageID,
         author: event.senderID,
         text: botResponse,
              });
            }
          }, event.messageID);
        } catch (error) {
          console.error("API Error:", error.message || error);
          api.sendMessage("error janu 🥲", event.threadID);
        }
      }
    }
  },
};
