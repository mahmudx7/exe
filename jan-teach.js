const axios = require("axios");

 const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud + "/api/jan";
};

module.exports.config = {
  name: "jan",
  aliases: ["jann","জান", "janu", "hinata"],
  version: "1.7",
  author: "MahMUD",
  countDown: 0,
  role: 0,
  category: "ai",
  guide: {
    en: "{pn} [message] OR\nteach [trigger] - [response1], [response2]... OR\nremove [trigger] - [index] OR\nlist OR\nlist all OR\nedit [trigger] - [newResponse] OR\nmsg [trigger]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  try {
    const userMessage = args.join(" ").toLowerCase();
    const uid = event.senderID;

    if (!args[0]) {
      const responses = ["𝐛𝐨𝐥𝐨 𝐣𝐚𝐧😎", "𝐛𝐨𝐥𝐨 𝐛𝐚𝐛𝐲🐥", "𝐡𝐞𝐥𝐥𝐨 𝐛𝐚𝐛𝐲🐤", "𝐇𝐮𝐦𝐦 𝐛𝐨𝐥𝐨😗"];
      return api.sendMessage(responses[Math.floor(Math.random() * responses.length)], event.threadID, event.messageID);
    }

    const apiUrl = await baseApiUrl();

    if (args[0] === "teach") {
      const [trigger, responses] = userMessage.replace("teach ", "").split(" - ");
      if (!trigger || !responses) {
        return api.sendMessage("❌ | teach [trigger] - [response1, response2,...]", event.threadID, event.messageID);
      }

      const response = await axios.post(`${apiUrl}/teach`, {
        trigger,
        responses,
        userID: uid
      });

      const userName = await usersData.getName(uid) || "Unknown User";
      return api.sendMessage(`✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID);
    }

    if (args[0] === "remove") {
      const [trigger, index] = userMessage.replace("remove ", "").split(" - ");
      if (!trigger || !index) {
      return api.sendMessage("❌ | remove [trigger] - [index]", event.threadID, event.messageID);
      }

      const response = await axios.delete(`${apiUrl}/remove`, { data: { trigger, index: parseInt(index, 10) } });
      return api.sendMessage(`"${response.data.message}"`, event.threadID, event.messageID);
    }

    if (args[0] === "list") {
      const endpoint = args[1] === "all" ? "/list/all" : "/list";
      const response = await axios.get(`${apiUrl}${endpoint}`);

      if (args[1] === "all") {
        let message = "👑 List of all teachers:\n\n";
        const data = Object.entries(response.data.data);
        for (let i = 0; i < data.length; i++) {
        const [userID, count] = data[i];
        const name = await usersData.getName(userID) || "Unknown";
        message += `${i + 1}. ${name}: ${count}\n`;
        }
        return api.sendMessage(message, event.threadID, event.messageID);
      }

      return api.sendMessage(response.data.message, event.threadID, event.messageID);
    }

    if (args[0] === "edit") {
      const allowedUserID = "61556006709662";
      if (uid !== allowedUserID) {
      return api.sendMessage("❌ Unauthorized!", event.threadID, event.messageID);
      }

      const [oldTrigger, newResponse] = userMessage.replace("edit ", "").split(" - ");
      if (!oldTrigger || !newResponse) {
        return api.sendMessage("❌ Format: edit [trigger] - [newResponse]", event.threadID, event.messageID);
      }

      await axios.put(`${apiUrl}/edit`, { oldTrigger, newResponse });
      return api.sendMessage(`✅ Edited "${oldTrigger}" to "${newResponse}"`, event.threadID, event.messageID);
    }

      if (args[0] === "msg") {
      const searchTrigger = args.slice(1).join(" ");
      if (!searchTrigger) return api.sendMessage("❌ Please provide a message to search.", event.threadID, event.messageID);

      try {
        const response = await axios.get(`${apiUrl}/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
        if (response.data.message) return api.sendMessage(response.data.message, event.threadID, event.messageID);
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || "❌ An unknown error occurred";
        return api.sendMessage(errorMessage, event.threadID, event.messageID);
      }
    }

    const entry = await axios.get(`${apiUrl}/msg`, { params: { userMessage } });
    if (entry.data?.result) return api.sendMessage(entry.data.result, event.threadID, event.messageID);

    return api.sendMessage("I don't know this yet. Use 'teach [message] - [response]'", event.threadID, event.messageID);
  } catch (error) {
    return api.sendMessage(`${error.response?.data || error.message}`, event.threadID, event.messageID);
  }
};
