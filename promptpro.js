const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json" );
  return base.data.mahmud;
};

 function autoDescribe(mode, userPrompt) {
  const style = mode.charAt(0).toUpperCase() + mode.slice(1);
  return `${userPrompt} Describe this without extra text ${style} style`;
}

module.exports = {
  config: {
    name: "promptpro",
    aliases: ["ppro"],
    version: "1.7",
    author: "MahMUD",
    category: "ai",
    guide: {
       en: "{pn} [-flux/-ai/-gpt/-midjourney/-dalle/-gemini] <prompt> (reply with an image optional)\n\nMust provide a prompt, otherwise command will block."
    }
  },

  onStart: async function ({ api, args, event }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
     if (module.exports.config.author !== obfuscatedAuthor) {
     return api.sendMessage("You are not authorized to change the author name.",
     event.threadID, event.messageID );
    }

    
     const allowedModes = ["-flux", "-ai", "-gpt", "-midjourney", "-dalle", "-gemini"];
     let mode = "default";
     if (args[0]?.toLowerCase() === "list") {
     return api.sendMessage(`📜 Available Modes:\n${allowedModes.join("\n")}`, event.threadID, event.messageID );
    }
      
     if (args[0]?.startsWith("-")) { if (allowedModes.includes(args[0])) {
     mode = args[0].replace("-", ""); args.shift(); } else {
     return api.sendMessage(`❌ Wrong mode! Use only: ${allowedModes.join(", ")}`,
     event.threadID, event.messageID);}
    }

     const apiUrl = `${await mahmud()}/api/prompt`;
     const userPrompt = args.join(" ").trim();
     if (!userPrompt && !(event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo")) {
     return api.sendMessage("❌ Please provide a prompt or reply to an image!", event.threadID, event.messageID  );
   }
    
     let imageUrl;
    if (
      event.type === "message_reply" &&
      event.messageReply.attachments[0]?.type === "photo") {
      imageUrl = event.messageReply.attachments[0].url;
    }

      const prompt = autoDescribe(mode, userPrompt);  try {
      const payload = { prompt, mode };
      if (imageUrl) payload.imageUrl = imageUrl;
      const response = await axios.post(apiUrl, payload, {
      headers: { "Content-Type": "application/json", author: module.exports.config.author }
      });

      const reply = response.data.error || response.data.response || "No response";
      api.sendMessage(reply, event.threadID, event.messageID);
      api.setMessageReaction(imageUrl ? "🪽" : "✨", event.messageID, () => {}, true);
    } catch (e) {
      api.sendMessage("❌ An error occurred.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
