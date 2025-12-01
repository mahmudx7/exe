const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports.config = {
  name: "flux",
  version: "1.7",
  role: 0,
  author: "MahMUD",
  description: "Flux Image Generator with random seed",
  category: "Image gen",
  guide: "{pn} [prompt]",
  countDown: 15,
};

module.exports.onStart = async ({ event, args, api }) => {
  const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
    return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }
  
   try {
    if (!args.length) {
      return api.sendMessage(
        "Please provide a prompt!",
        event.threadID,
        event.messageID
      );
    }

    const prompt = args.join(" ");
    const seed = Math.floor(Math.random() * 1000000); 

    const waitMessage = await api.sendMessage(
      "✅ image Generating, please wait...!!",
      event.threadID
    );

    try {
      const url = `${await baseApiUrl()}/api/gen?prompt=${encodeURIComponent(
        prompt
      )}&model=flux&seed=${seed}`;

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, `flux_${Date.now()}.png`);
      fs.writeFileSync(filePath, response.data);
      api.unsendMessage(waitMessage.messageID);
      api.sendMessage(
        {
          body: `𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐟𝐥𝐮𝐱 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        event.messageID
      );

      setTimeout(() => fs.unlinkSync(filePath), 5000);
    } catch (err) {
      console.error(err);
      api.sendMessage(
        "🥹error contact, MahMUD. " + err.message,
        event.threadID,
        event.messageID
      );
    }
  } catch (e) {
    console.error(e);
  }
};
