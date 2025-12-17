const Canvas = require("canvas");
const mongoose = require('mongoose');

// --- VIP Schema --- 
const vipSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    expiredAt: { type: Date, required: true }
});
const VipUser = mongoose.models.VipUser || mongoose.model("VipUser", vipSchema);

// --- USERS Schema --- 
const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: "Unknown" },
    exp: { type: Number, default: 0, index: true }
});
userSchema.index({ exp: -1, userID: 1 });
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

const defaultFontName = "BeVietnamPro-SemiBold";
const defaultPathFontName = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;
const { randomString } = global.utils;
const percentage = total => total / 100;

Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, {
    family: "BeVietnamPro-Bold"
});
Canvas.registerFont(defaultPathFontName, {
    family: defaultFontName
});

let deltaNext;
const expToLevel = (exp, deltaNextLevel = deltaNext) => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
const levelToExp = (level, deltaNextLevel = deltaNext) => Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);

module.exports = {
    config: {
        name: "rank2",
        version: "2.0",
        author: "NTKhang & Gemini",
        countDown: 5,
        role: 0,
        description: {
            vi: "Xem level hoặc bảng xếp hạng top 5",
            en: "View your level or the top 5 leaderboard"
        },
        category: "rank",
        guide: {
            vi: "   {pn} [để trống | @tags | top]",
            en: "   {pn} [empty | @tags | top]"
        },
        envConfig: {
            deltaNext: 5
        }
    },

    onStart: async function ({ message, event, args, commandName, envCommands, api }) {
        deltaNext = envCommands[commandName].deltaNext;

        // --- CASE: TOP 5 RANK ---
        if (args[0] === "top") {
            const topUsers = await Users.find().sort({ exp: -1 }).limit(5).lean();
            if (topUsers.length === 0) return message.reply("No users found in database.");

            const cardBuffers = await Promise.all(topUsers.map(async (user) => {
                return await makeRankCard(user.userID, deltaNext, api, true);
            }));

            const combinedCanvas = Canvas.createCanvas(2000, 500 * cardBuffers.length);
            const ctx = combinedCanvas.getContext("2d");

            for (let i = 0; i < cardBuffers.length; i++) {
                const img = await Canvas.loadImage(cardBuffers[i]);
                ctx.drawImage(img, 0, i * 500);
            }

            return message.reply({
                attachment: combinedCanvas.toBuffer()
            });
        }

        // --- CASE: NORMAL RANK / MENTIONS ---
        let targetUsers = Object.keys(event.mentions).length === 0 ? [event.senderID] : Object.keys(event.mentions);

        const rankCards = await Promise.all(targetUsers.map(async userID => {
            const buffer = await makeRankCard(userID, deltaNext, api, true);
            return {
                value: buffer,
                options: { filename: `${randomString(10)}.png` }
            };
        }));

        return message.reply({ attachment: rankCards.map(c => c.value) });
    },

    onChat: async function ({ event }) {
        try {
            await Users.updateOne(
                { userID: event.senderID },
                { $inc: { exp: 1 } },
                { upsert: true }
            );
        } catch (e) {
            console.error("Error in onChat updating EXP:", e);
        }
    }
};

const defaultDesignCard = {
    widthCard: 2000,
    heightCard: 500,
    main_color: "#474747",
    sub_color: "rgba(255, 255, 255, 0.5)",
    alpha_subcard: 0.9,
    exp_color: "#e1e1e1",
    expNextLevel_color: "#3f3f3f",
    text_color: "#000000",
    line_color: "#FFD700"
};

async function makeRankCard(userID, deltaNext, api, returnBuffer = false) {
    let userData = await Users.findOne({ userID: userID }).lean();

    if (!userData) {
        let name = "Unknown";
        try {
            const info = await api.getUserInfo(userID);
            name = info[userID].name || "Unknown";
        } catch (e) {}
        userData = { userID, exp: 0, name };
        await Users.create(userData);
    }

    const { exp, name } = userData;
    const levelUser = expToLevel(exp, deltaNext);
    const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
    const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);

    const totalUsers = await Users.countDocuments();
    const rankUsers = await Users.countDocuments({ exp: { $gt: exp } });
    const rank = rankUsers + 1;

    let isVip = false;
    const vip = await VipUser.findOne({ uid: userID, expiredAt: { $gt: new Date() } });
    if (vip) isVip = true;

    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    
    const dataLevel = {
        exp: currentExp,
        expNextLevel,
        name,
        rank: `#${rank}/${totalUsers}`,
        level: levelUser,
        avatar: avatarUrl,
        isVip
    };

    const image = new RankCard({ ...defaultDesignCard, ...dataLevel });
    return await image.buildCard();
}

class RankCard {
    constructor(options) {
        this.widthCard = 2000;
        this.heightCard = 500;
        this.main_color = "#474747";
        this.sub_color = "rgba(255, 255, 255, 0.5)";
        this.alpha_subcard = 0.9;
        this.exp_color = "#e1e1e1";
        this.text_color = "#ffffff";
        this.fontName = "BeVietnamPro-Bold";
        this.isVip = false;
        Object.assign(this, options);
    }

    async buildCard() {
        const { widthCard, heightCard, sub_color, alpha_subcard, exp_color, text_color, line_color, exp, expNextLevel, name, level, rank, avatar, isVip } = this;
        const canvas = Canvas.createCanvas(widthCard, heightCard);
        const ctx = canvas.getContext("2d");

        // Background
        const alignRim = 3 * percentage(widthCard);
        ctx.globalAlpha = parseFloat(alpha_subcard);
        await this.checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20);
        ctx.globalAlpha = 1;

        // Avatar & Lines logic
        const xyAvatar = heightCard / 2;
        const resizeAvatar = 60 * percentage(heightCard);
        const widthLineBetween = 58 * percentage(widthCard);
        const heightLineBetween = 2 * percentage(heightCard);
        const angleLineCenter = 40;
        const edge = (heightCard / 2) * Math.tan((angleLineCenter * Math.PI) / 180);

        ctx.fillStyle = line_color || "#FFD700";
        ctx.beginPath();
        ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);

        // Drawing Avatar
        try {
            const imgAvt = await Canvas.loadImage(avatar);
            this.centerImage(ctx, imgAvt, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);
        } catch(e) {
            const imgAvt = await Canvas.loadImage("https://i.imgur.com/eB3V1XN.png");
            this.centerImage(ctx, imgAvt, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);
        }

        // Exp Bar
        const radius = 6 * percentage(heightCard);
        const xStartExp = 26.5 * percentage(widthCard), yStartExp = 67 * percentage(heightCard), widthExp = 40.5 * percentage(widthCard);
        const widthExpCurrent = (exp / expNextLevel) * widthExp;

        ctx.fillStyle = "#3f3f3f";
        this.drawSquareRounded(ctx, xStartExp, yStartExp, widthExp, radius * 2, radius, "#3f3f3f");
        this.drawSquareRounded(ctx, xStartExp, yStartExp, widthExpCurrent, radius * 2, radius, exp_color);

        // Text
        ctx.fillStyle = text_color;
        ctx.textAlign = "center";
        ctx.font = this.autoSizeFont(52.1 * percentage(widthCard), 80, name, ctx, this.fontName);
        ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

        ctx.font = `35px ${this.fontName}`;
        ctx.fillText(`Exp ${exp}/${expNextLevel}`, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

        ctx.textAlign = "end";
        ctx.font = `70px ${this.fontName}`;
        ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));
        ctx.font = `60px ${this.fontName}`;
        ctx.fillText(`Lv ${level}`, 94 * percentage(widthCard), 32 * percentage(heightCard));

        if (isVip) {
            try {
                const vipLogo = await Canvas.loadImage("https://i.imgur.com/zNzNEpN.jpeg");
                ctx.drawImage(vipLogo, widthCard - 250, 50, 150, 150);
            } catch (e) {}
        }

        return canvas.toBuffer();
    }

    async checkColorOrImageAndDraw(x, y, w, h, ctx, res, r) {
        if (res.startsWith("http")) {
            const img = await Canvas.loadImage(res);
            ctx.save();
            this.roundedImage(x, y, w, h, r, ctx);
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
        } else {
            this.drawSquareRounded(ctx, x, y, w, h, r, res);
        }
    }

    drawSquareRounded(ctx, x, y, w, h, r, color) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    roundedImage(x, y, w, h, r, ctx) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    centerImage(ctx, img, x, y, w, h) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, w / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        ctx.restore();
    }

    autoSizeFont(maxWidth, maxSize, text, ctx, font) {
        let size = maxSize;
        ctx.font = `${size}px ${font}`;
        while (ctx.measureText(text).width > maxWidth && size > 10) {
            size--;
            ctx.font = `${size}px ${font}`;
        }
        return `${size}px ${font}`;
    }
  }
