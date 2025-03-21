const axios = require("axios");

module.exports.config = {
  name: "jan",
  version: "1.7",
  author: "MahMUD",
  countDown: 0,
  role: 0,
  category: "ai",
  guide: {
    en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2]... OR\nremove [YourMessage] OR\nlist OR\nlist all OR\nedit [YourMessage] - [NewMessage] OR\nmsg [YourMessage]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const userMessage = args.join(" ").toLowerCase();
  const uid = event.senderID;

  if (!args[0]) {
    const responses = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
    return api.sendMessage(responses[Math.floor(Math.random() * responses.length)], event.threadID, event.messageID);
  }

  if (args[0] === "teach") {
    const [trigger, responses] = userMessage.replace("teach ", "").split(" - ");
    if (!trigger || !responses) {
      return api.sendMessage("❌ | Invalid format! Make sure to use the format: teach [trigger] - [response1, response2, ...]", event.threadID, event.messageID);
    }

    const responseArray = responses.split(", ").map(res => res.toLowerCase());

    // Check if the trigger already exists in the database
    try {
      const response = await axios.post('https://mahmud-teach.onrender.com/api/teach', {
        trigger,
        responses: responseArray.join(", "),
        userID: uid
      });

      const userTeach = response.data.count || 0;
      const userName = await usersData.getName(uid) || "Unknown User";

      return api.sendMessage(`✅ Replies added\nReplies "${responses}" added to "${trigger}".\nTeacher: ${userName}\nTeachs: ${userTeach}`, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | Error occurred while adding teach response: ${error.response ? error.response.data : error.message}`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "remove") {
    const [trigger, index] = userMessage.replace("remove ", "").split(" - ");
    if (!trigger || !index) {
      return api.sendMessage("❌ | Invalid format! Make sure to use the format: remove [trigger] - [index]", event.threadID, event.messageID);
    }

    try {
      const response = await axios.delete('https://mahmud-teach.onrender.com/api/remove', {
        data: { trigger, index: parseInt(index, 10) }
      });

      return api.sendMessage(`✅ Removed response: "${response.data.message}"`, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | Error occurred while removing teach response: ${error.response ? error.response.data : error.message}`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "list" && args.length === 1) {
    try {
      const response = await axios.get('https://mahmud-teach.onrender.com/api/list');
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | Error occurred while fetching teach list: ${error.response ? error.response.data : error.message}`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "list" && args[1] === "all") {
    try {
      const response = await axios.get('https://mahmud-teach.onrender.com/api/list/all');

      let message = "List of all teachers 👑\n\n";
      const data = Object.entries(response.data.data);

      for (let index = 0; index < data.length; index++) {
        const [userID, count] = data[index];
        const name = await usersData.getName(userID);
        message += `${index + 1}. ${name}: ${count}\n`;
      }

      return api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | Error occurred while fetching teach data: ${error.response ? error.response.data : error.message}`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "edit") {
    const allowedUserID = "61556006709662";
    if (uid !== allowedUserID) {
      return api.sendMessage("❌ You are not authorized to edit responses.", event.threadID, event.messageID);
    }

    const [oldTrigger, newResponse] = userMessage.replace("edit ", "").split(" - ");
    if (!oldTrigger || !newResponse) {
      return api.sendMessage("❌ | Invalid format! Use: edit [old trigger] - [new response]", event.threadID, event.messageID);
    }

    try {
      const response = await axios.put('https://mahmud-teach.onrender.com/api/edit', {
        oldTrigger,
        newResponse
      });

      return api.sendMessage(`✅ Edited response for "${oldTrigger}" to "${newResponse}"`, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | Error occurred while editing teach response: ${error.response ? error.response.data : error.message}`, event.threadID, event.messageID);
    }
  }

  if (args[0] === "msg") {
    const searchTrigger = userMessage;

    try {
      const response = await axios.get(`https://mahmud-teach.onrender.com/api/msg?userMessage=${encodeURIComponent(searchTrigger)}`);
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`❌ | No entry found for "${searchTrigger}"`, event.threadID, event.messageID);
    }
  }
};
