const Canvas = require("canvas");
const axios = require("axios");
const mongoose = require('mongoose');

// --- VIP Schema ---
const vipSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  expiredAt: { type: Date, required: true }
});
const VipUser = mongoose.models.VipUser || mongoose.model("VipUser", vipSchema);
// ------------------

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

module.exports = {
	config: {
		name: "rank2",
		version: "2.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem level. Sửa lỗi getAll và tối ưu tốc độ.",
			en: "View level. Fixed getAll error and speed optimized."
		},
		category: "rank",
		guide: {
			vi: "   {pn} [để trống | @tags]",
			en: "   {pn} [empty | @tags]"
		},
		envConfig: {
			deltaNext: 5
		}
	},

	onStart: async function (args) {
		const { message, event, commandName, envCommands, api } = args;
		
		// FAIL-SAFE: Try multiple ways to find usersData
		const usersData = args.usersData || global.GoatBot?.usersData || global.client?.usersData;
		
		if (!usersData) {
			return message.reply("Could not initialize usersData. Please check bot version.");
		}

		deltaNext = envCommands[commandName].deltaNext;
		
		const arrayMentions = Object.keys(event.mentions);
		const targetUsers = arrayMentions.length == 0 ? [event.senderID] : arrayMentions;

		// Pre-fetch data efficiently
		const allUsers = await usersData.getAll();
		allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));

		const rankCards = await Promise.all(targetUsers.map(async userID => {
			const rankCard = await makeRankCard(userID, allUsers, usersData, deltaNext, api);
			rankCard.path = `${randomString(10)}.png`;
			return rankCard;
		}));

		return message.reply({ attachment: rankCards });
	},

	onChat: async function ({ usersData, event }) {
		let { exp } = await usersData.get(event.senderID);
		if (isNaN(exp) || typeof exp != "number") exp = 0;
		try {
			await usersData.set(event.senderID, { exp: exp + 1 });
		} catch (e) { }
	}
};

async function makeRankCard(userID, allUser, usersData, deltaNext, api) {
	const userData = allUser.find(u => u.userID == userID) || await usersData.get(userID);
	const exp = userData.exp || 0;
	
	const levelUser = expToLevel(exp, deltaNext);
	const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
	const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);

	const rank = allUser.findIndex(user => user.userID == userID) + 1;

	let isVip = false;
	try {
		const vip = await VipUser.findOne({ uid: userID, expiredAt: { $gt: new Date() } }).lean();
		if (vip) isVip = true;
	} catch (error) {
		console.error("Error fetching VIP status:", error);
	}

	// Fetch Avatar using Graph API
	let avatarImg;
	try {
		const response = await axios.get(
			`https://graph.facebook.com/${userID}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
			{ responseType: "arraybuffer" }
		);
		avatarImg = await Canvas.loadImage(Buffer.from(response.data, "binary"));
	} catch (e) {
		const url = await usersData.getAvatarUrl(userID);
		avatarImg = await Canvas.loadImage(url);
	}

	const dataLevel = {
		exp: currentExp,
		expNextLevel,
		name: userData.name || "User",
		rank: `#${rank}/${allUser.length}`,
		level: levelUser,
		avatarImg: avatarImg,
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
		const { main_color, sub_color, alpha_subcard, exp_color, expNextLevel_color, text_color, name_color, level_color, rank_color, line_color, exp_text_color, exp, expNextLevel, name, level, rank, avatarImg, isVip } = this;

		const canvas = Canvas.createCanvas(widthCard, heightCard);
		const ctx = canvas.getContext("2d");

		const alignRim = 3 * percentage(widthCard);
		ctx.globalAlpha = parseFloat(alpha_subcard || 0);
		await checkColorOrImageAndDraw(alignRim, alignRim, widthCard - alignRim * 2, heightCard - alignRim * 2, ctx, sub_color, 20);
		ctx.globalAlpha = 1;

		ctx.globalCompositeOperation = "destination-out";
		const xyAvatar = heightCard / 2;
		const resizeAvatar = 60 * percentage(heightCard);
		const widthLineBetween = 58 * percentage(widthCard);
		const heightLineBetween = 2 * percentage(heightCard);
		const angleLineCenter = 40;
		const edge = heightCard / 2 * Math.tan(angleLineCenter * Math.PI / 180);

		if (line_color) {
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = ctx.strokeStyle = checkGradientColor(ctx, Array.isArray(line_color) ? line_color : [line_color], xyAvatar - resizeAvatar / 2 - heightLineBetween, 0, xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
			ctx.beginPath();
			ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
			ctx.fill();
		}
		
		ctx.beginPath();
		ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
		ctx.fill();
		
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillRect(0, 0, widthCard, alignRim);
		ctx.fillRect(0, heightCard - alignRim, widthCard, alignRim);

		ctx.globalCompositeOperation = "source-over";
		centerImage(ctx, avatarImg, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);

		const radius = 6 * percentage(heightCard);
		const xStartExp = (25 + 1.5) * percentage(widthCard), yStartExp = 67 * percentage(heightCard), widthExp = 40.5 * percentage(widthCard), heightExp = radius * 2;

		ctx.beginPath();
		ctx.fillStyle = checkGradientColor(ctx, expNextLevel_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
		ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
		ctx.fill();
		ctx.fillRect(xStartExp, yStartExp, widthExp, heightExp);
		ctx.arc(xStartExp + widthExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, false);
		ctx.fill();

		const widthExpCurrent = (100 / expNextLevel * exp) * percentage(widthExp);
		ctx.fillStyle = checkGradientColor(ctx, exp_color, xStartExp, yStartExp, xStartExp + widthExp, yStartExp);
		ctx.beginPath();
		ctx.arc(xStartExp, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI, true);
		ctx.fill();
		ctx.fillRect(xStartExp, yStartExp, widthExpCurrent, heightExp);
		ctx.beginPath();
		ctx.arc(xStartExp + widthExpCurrent - 1, yStartExp + radius, radius, 1.5 * Math.PI, 0.5 * Math.PI);
		ctx.fill();

		ctx.textAlign = "end";
		ctx.font = autoSizeFont(18.4 * percentage(widthCard), 4 * percentage(widthCard), rank, ctx, this.fontName);
		ctx.fillStyle = rank_color || text_color;
		ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));

		ctx.font = autoSizeFont(9.8 * percentage(widthCard), 3.25 * percentage(widthCard), `Lv ${level}`, ctx, this.fontName);
		ctx.fillStyle = level_color || text_color;
		ctx.fillText(`Lv ${level}`, 94 * percentage(widthCard), 32 * percentage(heightCard));

		ctx.textAlign = "center";
		ctx.font = autoSizeFont(52.1 * percentage(widthCard), 4 * percentage(widthCard), name, ctx, this.fontName);
		ctx.fillStyle = name_color || text_color;
		ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

		ctx.font = autoSizeFont(49 * percentage(widthCard), 2 * percentage(widthCard), `Exp ${exp}/${expNextLevel}`, ctx, this.fontName);
		ctx.fillStyle = exp_text_color || text_color;
		ctx.fillText(`Exp ${exp}/${expNextLevel}`, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

		if (isVip) {
			try {
				const badgeSize = 170;
				const vipLogo = await Canvas.loadImage("https://i.imgur.com/zNzNEpN.jpeg");
				ctx.drawImage(vipLogo, widthCard - badgeSize - 530, heightCard / 2 - badgeSize / 2 - 100, badgeSize, badgeSize);
			} catch (e) {}
		}

		ctx.globalCompositeOperation = "destination-over";
		ctx.fillStyle = checkGradientColor(ctx, main_color, 0, 0, widthCard, heightCard);
		drawSquareRounded(ctx, 0, 0, widthCard, heightCard, radius, main_color);

		return canvas.createPNGStream();
	}
}

async function checkColorOrImageAndDraw(xStart, yStart, width, height, ctx, colorOrImage, r) {
	if (!colorOrImage.match?.(/^https?:\/\//)) {
		drawSquareRounded(ctx, xStart, yStart, width, height, r, colorOrImage);
	} else {
		const imageLoad = await Canvas.loadImage(colorOrImage);
		ctx.save();
		roundedImage(xStart, yStart, width, height, r, ctx);
		ctx.clip();
		ctx.drawImage(imageLoad, xStart, yStart, width, height);
		ctx.restore();
	}
}

function drawSquareRounded(ctx, x, y, w, h, r, color) {
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

function roundedImage(x, y, width, height, radius, ctx) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function centerImage(ctx, img, xCenter, yCenter, w, h) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(xCenter, yCenter, w / 2, 0, 2 * Math.PI);
	ctx.clip();
	ctx.drawImage(img, xCenter - w / 2, yCenter - h / 2, w, h);
	ctx.restore();
}

function autoSizeFont(maxWidthText, maxSizeFont, text, ctx, fontName) {
	let sizeFont = maxSizeFont;
	ctx.font = sizeFont + "px " + fontName;
	while (ctx.measureText(text).width > maxWidthText && sizeFont > 10) {
		sizeFont--;
		ctx.font = sizeFont + "px " + fontName;
	}
	return sizeFont + "px " + fontName;
}

function checkGradientColor(ctx, color, x1, y1, x2, y2) {
	if (Array.isArray(color)) {
		const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
		color.forEach((c, index) => gradient.addColorStop(index / (color.length - 1), c));
		return gradient;
	}
	return color;
}

function isUrl(string) {
	try { new URL(string); return true; } catch (err) { return false; }
}
