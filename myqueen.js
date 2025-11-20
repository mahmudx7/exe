const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "myqueen",
    version: "1.0",
    author: "MahMUD",
    category: "love",
    guide: "{pn} @mention",
  },

  onStart: async function ({ api, usersData, event }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }
    const senderID = event.senderID;
    const mention = Object.keys(event.mentions)[0];

    if (!mention) {
      return api.sendMessage("❌ Mention someone to make them your Queen!", event.threadID, event.messageID);
    }

    const user1 = senderID;   
    const user2 = mention;     

    const data1 = await usersData.get(user1);
    const data2 = await usersData.get(user2);
    const name1 = data1.name;
    const name2 = data2.name;

    try {
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(
        `${apiUrl}/api/friend?user1=${user1}&user2=${user2}&style=2`,
        { responseType: "arraybuffer" }
      );

      const filePath = path.join(__dirname, `myqueen_${senderID}.png`);
      fs.writeFileSync(filePath, Buffer.from(data));

      api.sendMessage(
        {
          body: `𝐐𝐮𝐞𝐞𝐧 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭, 𝐫𝐮𝐥𝐞𝐫 𝐨𝐟 𝐦𝐲 𝐰𝐨𝐫𝐥𝐝 👸\n• ${name1}\n• ${name2}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (e) {
      api.sendMessage("🥹error, contact MahMUD." + e.message, event.threadID, event.messageID);
    }
  },
};
