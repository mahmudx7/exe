const axios = require("axios");

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "imgur",
    author: "MahMUD",
    version: "1.7",
    category: "media"
  },
  onStart: async function ({ api, event }) {
    try {
       const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
      if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage(
          "You are not authorized to change the author name.\n\nPlease author fix name to work with this cmd",
          event.threadID,
          event.messageID
        );
      }

       if (!event.messageReply || !event.messageReply.attachments) {
        return api.sendMessage(
          "❌ Please reply to an image or video message to upload it to Imgur.",
          event.threadID,
          event.messageID
        );
      }

      const attachment = event.messageReply.attachments[0].url;

        const response = await axios.post(
        "https://api.imgur.com/3/image",
        { image: attachment, type: "url" },
        {
          headers: {
            Authorization: "Client-ID 137256035dcfdcc"
          }
        }
      );

      const imgurLink = response.data.data.link;
      api.sendMessage(`${imgurLink}`, event.threadID, event.messageID);

    } catch (error) {
      console.error(error.response?.data || error.message);
      api.sendMessage(
        `❌ Failed to upload to Imgur.\n${error.response?.data?.data?.error || error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
