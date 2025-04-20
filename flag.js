const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "flaggame",
    aliases:["flag"],
    version: "1.7",
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
    const getCoin = 500;
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
        `🎉 | Correct answe baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      api.sendMessage(
        `🥺 | Wrong Answer baby\nCorrect answer was: ${flag}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/flag`, {
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
