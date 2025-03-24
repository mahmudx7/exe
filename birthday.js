module.exports = {
  config: {
    name: "birthday",
    aliases: ["wish"],
    version: "1.7",
    role: 0,
    author: "Mahmud",
    category: "love",
    countDown: 5,
    guide: {
      en: "{p}{n} @mention",
    },
  },

  onStart: async function ({ api, event }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return api.sendMessage(
        "❌ You need to tag someone to wish!",
        event.threadID,
        event.messageID
      );
    }

    const taggedUserID = mention[0];
    const taggedUserName = event.mentions[taggedUserID];

    try {
       const response = await fetch("https://wish-dl8h.onrender.com/wish", {
       method: "POST",
       headers: {
      "Content-Type": "application/json",
        },
     
          body: JSON.stringify({
          taggedUserID: taggedUserID,
          taggedUserName: taggedUserName,
          threadID: event.threadID,
          messageID: event.messageID,
        }),
      });

      const data = await response.json();

       if (data.status === "success") {
       const message = data.response;
       await api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage(
          "❌ Failed to send the birthday wish. Please try again later.",
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      api.sendMessage(
      "❌ Something went wrong while sending the birthday wish.",
      event.threadID,
      event.messageID
      );
    }
  },
};
