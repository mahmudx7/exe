const axios = require("axios");

const mahmud = async () => {
  const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return response.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
    config: {
        name: "blur",
        version: "1.7",
        author: "MahMUD",
        countDown: 5,
        role: 0,
        category: "image",
        guide: {
            en: "{pn} [ImgReply/imgLink] [1-100]"
        }
    },

    onStart: async function ({ api, args, message, event }) {
       const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
         if (module.exports.config.author !== obfuscatedAuthor) {
         return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
       }
      
         try {
            let imageUrl;
            let blurLevel = 50; 

            if (event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
                imageUrl = event.messageReply.attachments[0].url;
                if (args[0] && !isNaN(args[0])) {
                    const level = parseInt(args[0]);
                    if (level >= 1 && level <= 100) blurLevel = level;
                    else return message.reply("❌ | Please enter a blur level between 1–100.");
                }
            } else if (args[0]?.startsWith("http")) {
                imageUrl = args[0];
                if (args[1] && !isNaN(args[1])) {
                    const level = parseInt(args[1]);
                    if (level >= 1 && level <= 100) blurLevel = level;
                    else return message.reply("❌ | Please enter a blur level between 1–100.");
                }
            } else if (!isNaN(args[0]) && event.type === "message_reply" && event.messageReply.attachments?.length > 0) {
                const level = parseInt(args[0]);
                if (level >= 1 && level <= 100) {
                    blurLevel = level;
                    imageUrl = event.messageReply.attachments[0].url;
                } else return message.reply("❌ | Please enter a blur level between 1–100.");
            } else return message.reply("❌ | Please reply to an image or provide an image URL.");

            api.setMessageReaction("😘", event.messageID, () => {}, true);
            const waitMsg = await message.reply("Baby, Please wait a moment <😘");
         
            const apiUrl = await mahmud();
            const imgStream = `${apiUrl}/api/blur/mahmud?url=${encodeURIComponent(imageUrl)}&blurLevel=${blurLevel}`;

            api.setMessageReaction("✅", event.messageID, () => {}, true);
            message.unsend(waitMsg.messageID);
            message.reply({
                body: `Here's your ${blurLevel}% blurred image baby. <😘`,
                attachment: await global.utils.getStreamFromURL(imgStream)
            });

        } catch (error) {
            console.error(error);
            message.reply(`🥹error, contact MahMUD.`);
        }
    }
};
