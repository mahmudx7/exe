module.exports = {
  config: {
    name: "birthday",
    aliases: ["wish"],
    version: "1.7",
    role: 0,
    author: "MahMUD",
    category: "love",
    countDown: 5,
    guide: { en: "{p}{n} @mention" },
  },

  onStart: async function ({ api, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return api.sendMessage("❌ You need to tag someone to wish!", event.threadID, event.messageID);
    }

    const taggedUserName = event.mentions[mention[0]].replace('@', '');
    try {
      const response = await fetch(`https://mahmud-wish.onrender.com/wish/font3?taggedUserName=${taggedUserName}`);
      const data = await response.json();
      if (data.status === "success") {
        api.sendMessage(data.response, event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ Failed to send the birthday wish. Please try again later.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage(`❌ Something went wrong: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
