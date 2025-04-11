const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
    config: {
        name: "pin",
        version: "1.7",
        author: "MahMUD",
        role: 0,
        category: "media",
        guide: {
            en: "{pn} <search query> <number of images>\nExample: {pn} goku Ultra - 10"
        }
    },

    onStart: async function ({ api, event, args }) {
        const [keySearch, count] = args.join(" ").split(" - ");

        if (!keySearch) {
            return api.sendMessage("Please enter a search query.\nExample: {pn} goku Ultra - 10.", event.threadID, event.messageID);
        }

        const numberSearch = count ? Math.min(parseInt(count), 20) : 6;
        const apiUrl = `https://mahmud-pin-api.onrender.com/pin?search=${encodeURIComponent(keySearch)}&count=${numberSearch}`;

        try {
            const { data } = await axios.get(apiUrl);
            if (!data.data?.length) {
                return api.sendMessage("No images found.", event.threadID, event.messageID);
            }

            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const imgData = await Promise.all(data.data.slice(0, numberSearch).map(async (url, i) => {
                try {
                    const imgResponse = await axios.get(url, { responseType: "arraybuffer" });
                    const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
                    await fs.promises.writeFile(imgPath, imgResponse.data, "binary");
                    return fs.createReadStream(imgPath);
                } catch {
                    return null;
                }
            }));

            await api.sendMessage({ attachment: imgData.filter(Boolean) }, event.threadID, event.messageID);
            await fs.promises.rm(cacheDir, { recursive: true });

        } catch (error) {
            console.error(error);
            api.sendMessage(`error baby: ${error.message}`, event.threadID, event.messageID);
        }
    }
};
