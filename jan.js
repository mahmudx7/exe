const axios = require("axios");

const mahmud = [
  "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "hinata"
];

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.jan;
};

module.exports = {
  config: {
    name: "bot",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "ai",
    aliases: ["jan", "baby"],
    cooldown: 3,
    guide: [
      "{pn}bot jan → Talk with the bot",
      "{pn}jan I love you → Get bot response",
      "Say any word from: baby, jan, babu etc., to trigger bot"
    ]
  },

  onStart: async function ({ reply }) {
    reply("Hey jan 🥰! Just say something like 'jan I love you' or 'baby are you there?' and I’ll reply!");
  },

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      const message = event.body?.toLowerCase() || "hi";

      async function getBotResponse(message) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(message)}`);
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      const replyMessage = await getBotResponse(message);

      api.sendMessage(replyMessage, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: replyMessage,
          });
        }
      }, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const responses = [
      "babu khuda lagse🥺",
      "Hop beda😾, Boss বল boss😼",  
      "আমাকে ডাকলে , আমি কিন্তূ কিস করে দেবো😘",  
      "🐒🐒🐒",
      "bye",
      "naw message daw m.me/mahmud.x07",
      "mb ney bye",
      "meww",
      "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",  
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "__ফ্রী ফে'সবুক চালাই কা'রন ছেলেদের মুখ দেখা হারাম 😌",
      "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚"
    ];

    const message = event.body?.toLowerCase() || "";
    const words = message.split(" ");
    const wordCount = words.length;

    if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
      api.setMessageReaction("🪽", event.messageID, () => {}, true);
      api.sendTypingIndicator(event.threadID, true);

      async function getBotResponse(message) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(message)}`);
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      if (wordCount === 1) {
        const randomMsg = responses[Math.floor(Math.random() * responses.length)];
        api.sendMessage(randomMsg, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: randomMsg,
            });
          }
        }, event.messageID);
      } else {
        const userText = words.slice(1).join(" ");
        const botResponse = await getBotResponse(userText);
        api.sendMessage(botResponse, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: botResponse,
            });
          }
        }, event.messageID);
      }
    }
  },
};
