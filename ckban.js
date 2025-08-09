module.exports = {
  config: {
    name: "ckban",
    version: "1.7",
    author: 'MahMUD',
    countDown: 1,
    role: 0,
    category: 'general',
    guide: {
      en: '{pn}: Check if the bot is media banned.'
    }
  },

  onStart: async function ({ message, api, event }) {
    try {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage(
          "You are not authorized to change the author name.\n\nPlease author fix name to work with this cmd",
          event.threadID,
          event.messageID
        );
      }

      const checkImageURL = "https://i.ibb.co/2ntpM69/image.jpg";

      const checkMessage = await message.reply("Checking media ban 🐤");

      try {
        const attachment = await global.utils.getStreamFromURL(checkImageURL);

        if (!attachment) {
          throw new Error("Failed to create attachment. Stream is null or undefined.");
        }

        await message.reply(
          {
            body: "Media not banned ✅",
            attachment: attachment
          },
          async (error, info) => {
            if (info) {
              await api.editMessage("✅ The bot's media is not banned.", checkMessage.messageID);
            } else {
              message.reply("❌ The bot's media has been moye moye.");
              throw new Error("Media may be blocked, message did not send correctly.");
            }
          }
        );
      } catch (error) {
        console.error("Error encountered:", error.message || error);
        await api.editMessage("❌ The bot's media has been banned or an error occurred.", checkMessage.messageID);
      }
    } catch (outerError) {
      console.error("Outer error encountered:", outerError.message || outerError);
    }
  }
};
