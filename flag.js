const axios = require("axios");

module.exports = {
  config: {
    name: "flag",
    version: "2.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { flag, author } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) {
      return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐟𝐥𝐚𝐠 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    await api.unsendMessage(Reply.messageID);

    if (reply === flag.toLowerCase()) {
      userData.money += getCoin;
      userData.exp += getExp;
      await usersData.set(event.senderID, userData);

      api.sendMessage(
        `🎉 | Correct answer.\nYou have earned ${getCoin} coins and ${getExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      api.sendMessage(
        `🥺 | Wrong Answer!\nCorrect answer was: ${flag}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios({
        method: "GET",
        url: "https://mahmud-flag-api.onrender.com/api/random-flag",
        responseType: "json",
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const { link, country } = response.data;

      const imageStream = await axios({
        method: "GET",
        url: link,
        responseType: "stream",
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      api.sendMessage(
        {
          body: "🌍 A random flag has appeared! Guess the flag name.",
          attachment: imageStream.data
        },
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            flag: country
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`Error fetching flag: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
