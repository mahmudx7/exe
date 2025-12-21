const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp", "dp", "profile"],
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "media"
  },

  onStart: async function ({ message, event, args }) {
     const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);  
     if (module.exports.config.author !== obfuscatedAuthor) { return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID); }
    
    try {
      const target =
        Object.keys(event.mentions || {})[0] ||
        event.messageReply?.senderID ||
        args.join(" ") ||
        event.senderID;

        const apiUrl = `${await baseApiUrl()}/api/pfp?mahmud=${encodeURIComponent(target)}`;
        const res = await axios.get(apiUrl, {
        responseType: "stream"
      });

        return message.reply({
        body: "🎀 Here's the profile picture",
        attachment: res.data
      });

     } catch (e) {
       console.log(e?.response?.status, e?.message);
       return message.reply("🥹error, contact MahMUD");
     }
   }
 };
