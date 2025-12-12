const fs = require("fs");
const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports.config = {
  name: "brother",
  version: "1.7",
  role: 0,
  author: "MahMUD",
  category: "love",
  cooldowns: 5
};

module.exports.onStart = async ({ event, api, args }) => {
  const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
  try {
    const { threadID, messageID, senderID } = event;
    const mention = Object.keys(event.mentions)[0] || (event.messageReply && event.messageReply.senderID);
    if (!mention)
    return api.sendMessage("Please tag or reply to 1 person", threadID, messageID);

    const user1 = mention;
    const user2 = senderID;

    const baseUrl = await baseApiUrl();
    const apiUrl = `${baseUrl}/api/bro&sis?user1=${user1}&user2=${user2}&style=1`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    const imgPath = __dirname + `/cache/brother_${user1}_${user2}.png`;
    fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: `𝐋𝐢𝐟𝐞'𝐬 𝐛𝐞𝐭𝐭𝐞𝐫 𝐰𝐢𝐭𝐡 𝐚 𝐁𝐫𝐨𝐭𝐡𝐞𝐫 𝐛𝐲 𝐲𝐨𝐮𝐫 𝐬𝐢𝐝𝐞 🎀`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("🥹error, contact MahMUD.", event.threadID, event.messageID);
  }
};
