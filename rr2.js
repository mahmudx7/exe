const Canvas = require("canvas");
const mongoose = require('mongoose');

// --- VIP Schema --- 
const vipSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  expiredAt: { type: Date, required: true }
});
const VipUser = mongoose.models.VipUser || mongoose.model("VipUser", vipSchema);

// --- USERS Schema (Simplified) --- 
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  name: { type: String, default: "Unknown" }
});
const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

const defaultFontName = "BeVietnamPro-SemiBold";
const defaultPathFontName = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;
const { randomString } = global.utils;

Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, {
	family: "BeVietnamPro-Bold"
});
Canvas.registerFont(defaultPathFontName, {
	family: defaultFontName
});

global.client.makeRankCard = makeRankCard;

module.exports = {
	config: {
		name: "rank",
		version: "2.0",
		author: "NTKhang & Gemini",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem thông tin cá nhân của bạn hoặc người được tag",
			en: "View your profile or the profile of tagged users"
		},
		category: "info",
		guide: {
			vi: "   {pn} [để trống | @tags]",
			en: "   {pn} [empty | @tags]"
		}
	},
    
	onStart: async function ({ message, event, api }) {
		let targetUsers = Object.keys(event.mentions).length == 0 ? [event.senderID] : Object.keys(event.mentions);

		const rankCards = await Promise.all(targetUsers.map(async userID => {
			const rankCard = await makeRankCard(userID, api); 
			rankCard.path = `${randomString(10)}.png`;
			return rankCard;
		}));

		return message.reply({ attachment: rankCards });
	}
    // onChat has been fully removed
};

const defaultDesignCard = {
	widthCard: 2000,
	heightCard: 500,
	main_color: "#474747",
	sub_color: "rgba(255, 255, 255, 0.5)",
	alpha_subcard: 0.9,
	text_color: "#000000",
	line_color: "#FFD700"
};

async function makeRankCard(userID, api = global.GoatBot.fcaApi) {
    let userData = await Users.findOne({ userID: userID }).lean();
    
    if (!userData) {
         let name = "Unknown";
         try {
            const info = await api.getUserInfo(userID);
            name = info[userID].name || "Unknown";
         } catch (e) { console.warn(e); }
         
        userData = await Users.create({ userID: userID, name: name });
    }
    
    const totalUsers = await Users.countDocuments();
    // Rank is now based on Database Insertion Order or alphabetical since EXP is gone
    const rank = (await Users.find().sort({_id: 1})).findIndex(u => u.userID === userID) + 1;

	let isVip = !!(await VipUser.findOne({ uid: userID, expiredAt: { $gt: new Date() } }));
    
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

	const dataLevel = {
		name: userData.name, 
		rank: `#${rank}/${totalUsers}`,
		avatar: avatarUrl,
		isVip: isVip
	};

	const image = new RankCard({ ...defaultDesignCard, ...dataLevel });
	return await image.buildCard();
}

class RankCard {
	constructor(options) {
		this.widthCard = 2000;
		this.heightCard = 500;
		this.fontName = "BeVietnamPro-Bold";
		for (const key in options) this[key] = options[key];
	}

	async buildCard() {
		const { widthCard, heightCard, main_color, sub_color, alpha_subcard, text_color, line_color, name, rank, avatar, isVip } = this;
		const canvas = Canvas.createCanvas(widthCard, heightCard);
		const ctx = canvas.getContext("2d");

		// Draw Background
		const alignRim = 3 * percentage(widthCard);
		ctx.globalAlpha = parseFloat(alpha_subcard || 0.9);
		await checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20);
		ctx.globalAlpha = 1;

		// Draw Line/Design
		const xyAvatar = heightCard / 2;
		const resizeAvatar = 60 * percentage(heightCard);
		ctx.fillStyle = line_color;
		ctx.beginPath();
		ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + 10, 0, 2 * Math.PI);
		ctx.fill();

		// Avatar
		centerImage(ctx, await Canvas.loadImage(avatar), xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);

		// Text Rendering
		ctx.fillStyle = text_color;
		ctx.textAlign = "center";
		ctx.font = `bold ${80}px ${this.fontName}`;
		ctx.fillText(name, widthCard / 2, heightCard / 2);
		
		ctx.font = `40px ${this.fontName}`;
		ctx.fillText(`Member Rank: ${rank}`, widthCard / 2, heightCard / 2 + 80);

        // VIP Badge
        if (isVip) {
            try {
                const vipLogo = await Canvas.loadImage("https://i.imgur.com/zNzNEpN.jpeg");
                ctx.drawImage(vipLogo, widthCard - 300, 50, 150, 150);
            } catch (e) { console.error("VIP Load failed"); }
        }

		ctx.globalCompositeOperation = "destination-over";
		ctx.fillStyle = main_color;
		drawSquareRounded(ctx, 0, 0, widthCard, heightCard, 30, main_color);

		return canvas.createPNGStream();
	}
}

// Helper functions (percentage, centerImage, drawSquareRounded, etc.) remain as in your original file
function percentage(total) { return total / 100; }
async function checkColorOrImageAndDraw(x, y, w, h, ctx, color, r) {
    ctx.fillStyle = color;
    drawSquareRounded(ctx, x, y, w, h, r, color);
}
function drawSquareRounded(ctx, x, y, w, h, r, color) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
}
function centerImage(ctx, img, xCenter, yCenter, w, h) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(xCenter, yCenter, w / 2, 0, 2 * Math.PI);
	ctx.clip();
	ctx.drawImage(img, xCenter - w / 2, yCenter - h / 2, w, h);
	ctx.restore();
}
