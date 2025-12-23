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

global.client.makeRankCard = makeRankCard;

module.exports = {
	config: {
		name: "rank",
		version: "2.0",
		author: "NTKhang & Gemini",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem level của bạn (Đã tắt tự động tăng EXP/Delta)",
			en: "View your level (EXP auto-gain and Delta removed)"
		},
		category: "rank",
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
    // onChat removed fully to stop any automated EXP updates
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

/**
 * @description Creates the rank card with static level logic (Delta-free).
 */
async function makeRankCard(userID, api = global.GoatBot.fcaApi) {
    let userData = await Users.findOne({ userID: userID }).lean();
    
    if (!userData) {
         let name = "Unknown";
         try {
            const info = await api.getUserInfo(userID);
            name = info[userID].name || "Unknown";
         } catch (e) { console.warn(e); }
         
        userData = await Users.create({ userID: userID, exp: 0, name: name });
    }
    
    const { exp, name } = userData;
    
    // --- DELTA REMOVED ---
    // Using a fixed requirement of 1000 EXP per level for visual display
    const levelUser = Math.floor(exp / 1000); 
    const expNextLevel = (levelUser + 1) * 1000;
    const currentExp = exp;
    
    const totalUsers = await Users.countDocuments();
    const rankUsers = await Users.countDocuments({ exp: { $gt: exp } });
    const rank = rankUsers + 1;

	let isVip = false;
	try {
		const vip = await VipUser.findOne({ uid: userID, expiredAt: { $gt: new Date() } });
		if (vip) isVip = true;
	} catch (e) { console.error(e); }
    
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

	const dataLevel = {
		exp: currentExp,
		expNextLevel,
		name: name, 
		rank: `#${rank}/${totalUsers}`,
		level: levelUser,
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
		this.main_color = "#474747";
		this.sub_color = "rgba(255, 255, 255, 0.5)";
		this.alpha_subcard = 0.9;
		this.exp_color = "#e1e1e1";
		this.expNextLevel_color = "#3f3f3f";
		this.text_color = "#000000";
		this.fontName = "BeVietnamPro-Bold";
		this.textSize = 0;
		this.isVip = false;
		for (const key in options) this[key] = options[key];
	}

	async buildCard() {
		let { widthCard, heightCard } = this;
		const { main_color, sub_color, alpha_subcard, exp_color, expNextLevel_color, text_color, name_color, level_color, rank_color, line_color, exp_text_color, exp, expNextLevel, name, level, rank, avatar, isVip } = this;

		const canvas = Canvas.createCanvas(widthCard, heightCard);
		const ctx = canvas.getContext("2d");

		const alignRim = 3 * percentage(widthCard);
		ctx.globalAlpha = parseFloat(alpha_subcard || 0);
		await checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20, alpha_subcard);
		ctx.globalAlpha = 1;

		const xyAvatar = heightCard / 2;
		const resizeAvatar = 60 * percentage(heightCard);
		const widthLineBetween = 58 * percentage(widthCard);
		const heightLineBetween = 2 * percentage(heightCard);
		const angleLineCenter = 40;
		const edge = heightCard / 2 * Math.tan(angleLineCenter * Math.PI / 180);

		ctx.globalCompositeOperation = "source-over";
		if (line_color && !isUrl(line_color)) {
			ctx.fillStyle = ctx.strokeStyle = checkGradientColor(ctx, Array.isArray(line_color) ? line_color : [line_color], xyAvatar - resizeAvatar / 2, 0, xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
			ctx.beginPath();
			ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
			ctx.fill();
		}

		centerImage(ctx, await Canvas.loadImage(avatar), xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);

		const radius = 6 * percentage(heightCard);
		const xStartExp = (25 + 1.5) * percentage(widthCard), yStartExp = 67 * percentage(heightCard), widthExp = 40.5 * percentage(widthCard), heightExp = radius * 2;
		
		ctx.fillStyle = checkGradientColor(ctx, expNextLevel_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
		drawSquareRounded(ctx, xStartExp, yStartExp, widthExp, heightExp, radius, expNextLevel_color, true);

		// Progress logic: percentage of exp relative to the next milestone
		const widthExpCurrent = (exp / expNextLevel) * widthExp;
		ctx.fillStyle = checkGradientColor(ctx, exp_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
		drawSquareRounded(ctx, xStartExp, yStartExp, widthExpCurrent, heightExp, radius, exp_color, true);

		ctx.textAlign = "end";
		ctx.font = autoSizeFont(18 * percentage(widthCard), 4 * percentage(widthCard), rank, ctx, this.fontName);
		ctx.fillStyle = rank_color || text_color;
		ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));

		ctx.font = autoSizeFont(10 * percentage(widthCard), 3 * percentage(widthCard), `Lv ${level}`, ctx, this.fontName);
		ctx.fillText(`Lv ${level}`, 94 * percentage(widthCard), 32 * percentage(heightCard));

		ctx.textAlign = "center";
		ctx.font = autoSizeFont(52 * percentage(widthCard), 4 * percentage(widthCard), name, ctx, this.fontName);
		ctx.fillStyle = name_color || text_color;
		ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

		ctx.font = autoSizeFont(49 * percentage(widthCard), 2 * percentage(widthCard), `Exp ${exp}/${expNextLevel}`, ctx, this.fontName);
		ctx.fillStyle = exp_text_color || text_color;
		ctx.fillText(`Exp ${exp}/${expNextLevel}`, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

		if (isVip) {
			try {
				const vipLogo = await Canvas.loadImage("https://i.imgur.com/zNzNEpN.jpeg");
				ctx.drawImage(vipLogo, widthCard - 700, 50, 150, 150);
			} catch (e) {}
		}

		ctx.globalCompositeOperation = "destination-over";
		ctx.fillStyle = checkGradientColor(ctx, main_color, 0, 0, widthCard, heightCard);
		drawSquareRounded(ctx, 0, 0, widthCard, heightCard, radius, main_color);

		return canvas.createPNGStream();
	}
}

// --- Helper Functions ---
async function checkColorOrImageAndDraw(x, y, w, h, ctx, res, r) {
	if (!isUrl(res)) {
		ctx.fillStyle = checkGradientColor(ctx, res, x, y, x + w, y + h);
		drawSquareRounded(ctx, x, y, w, h, r, ctx.fillStyle);
	} else {
		const img = await Canvas.loadImage(res);
		ctx.save();
		roundedImage(x, y, w, h, r, ctx);
		ctx.clip();
		ctx.drawImage(img, x, y, w, h);
		ctx.restore();
	}
}

function drawSquareRounded(ctx, x, y, w, h, r, color, fill = true) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
	if (fill) { ctx.fillStyle = color; ctx.fill(); }
}

function roundedImage(x, y, w, h, r, ctx) {
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

function centerImage(ctx, img, x, y, w, h) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(x, y, w / 2, 0, Math.PI * 2);
	ctx.clip();
	ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
	ctx.restore();
}

function autoSizeFont(maxW, maxS, text, ctx, font) {
	let s = maxS;
	ctx.font = `${s}px ${font}`;
	while (ctx.measureText(text).width > maxW && s > 1) {
		s--;
		ctx.font = `${s}px ${font}`;
	}
	return `${s}px ${font}`;
}

function checkGradientColor(ctx, color, x1, y1, x2, y2) {
	if (!Array.isArray(color)) return color;
	const g = ctx.createLinearGradient(x1, y1, x2, y2);
	color.forEach((c, i) => g.addColorStop(i / (color.length - 1), c));
	return g;
}

function isUrl(s) { try { new URL(s); return true; } catch { return false; } }
