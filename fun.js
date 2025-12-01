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

module.exports = {
config: {
name: "fun",
aliases: ["dig", "funny"],
version: "1.7",
author: "MahMUD",
role: 0,
category: "fun",
cooldown: 10,
guide: "[type] [mention/reply/UID] | type 'list' to see all types",
},

onStart: async function({ api, event, args }) {
 const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
 if (module.exports.config.author !== obfuscatedAuthor) {
 return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
 }
  
const { threadID, messageID, messageReply, mentions, senderID } = event;
const type = args[0];
if (!type) return api.sendMessage("Provide a DIG type first!", threadID, messageID);

if (type.toLowerCase() === "list") {
  try {
    const res = await axios.get(`${await baseApiUrl()}/api/dig/list`);
    const types = res.data.types || [];
    const formattedList = types.map((t, i) => `${i + 1}. ${t}`).join("\n");
    return api.sendMessage(`Available funny Effect:\n${formattedList}`, threadID, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage(`🥹 Failed to fetch DIG list.`, threadID, messageID);
  }
}

let id = senderID;
let id2;
if (messageReply) {
  id2 = messageReply.senderID;
} else if (Object.keys(mentions).length > 0) {
  id2 = Object.keys(mentions)[0];
} else if (args[1]) {
  id2 = args[1];
} else {
  return api.sendMessage("Mention, reply, or provide UID of the target.", threadID, messageID);
}

try {
  const url = ["kiss", "fuse", "buttslap", "slap"].includes(type.toLowerCase())
    ? `${await baseApiUrl()}/api/dig?type=${type}&user=${id}&user2=${id2}`
    : `${await baseApiUrl()}/api/dig?type=${type}&user=${id2}`;

  const response = await axios.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(__dirname, `dig_${id2}.png`);
  fs.writeFileSync(filePath, response.data);

  api.sendMessage(
    {
      attachment: fs.createReadStream(filePath),
      body: `funny Effect: ${type.toUpperCase()} successful <🐸`
    },
    threadID,
    () => fs.unlinkSync(filePath),
    messageID
  );
} catch (err) {
  console.error(err);
  api.sendMessage(`🥹error, contact MahMUD.`, threadID, messageID);
}

}
};
