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
		name: "rank",
		version: "1.7",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem level của bạn hoặc người được tag. Có thể tag nhiều người",
			en: "View your level or the level of the tagged person. You can tag many people"
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
    
	onStart: async function ({ message, event, commandName, envCommands, api }) {
		deltaNext = envCommands[commandName].deltaNext;
		let targetUsers;
		const arrayMentions = Object.keys(event.mentions);

		if (arrayMentions.length == 0)
			targetUsers = [event.senderID];
		else
			targetUsers = arrayMentions;

		const rankCards = await Promise.all(targetUsers.map(async userID => {
			const rankCardBuffer = await makeRankCard(userID, deltaNext, api); 
			return {
				body: "",
				attachment: rankCardBuffer,
				path: `${randomString(10)}.png`
			};
		}));

		for (const card of rankCards) {
			await message.reply(card);
		}
	},

	onChat: async function ({ event }) { 
		try {
			await Users.updateOne(
                { userID: event.senderID }, 
                { $inc: { exp: 1 } }, 
                { upsert: true }
            );
		}
		catch (e) { 
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

async function makeRankCard(userID, deltaNext, api = global.GoatBot.fcaApi) {
    let userData = null;
    try {
        userData = await Users.findOne({ userID: userID }).lean();
        if (!userData) {
             let name = "Unknown";
             try {
                const info = await api.getUserInfo(userID);
                name = info[userID].name || "Unknown";
             } catch (e) {
                console.warn(`[RANK MAKE] Failed to fetch name for new user ${userID}`);
             }
            userData = { userID: userID, exp: 0, name: name };
            await Users.create(userData);
        }
    } catch (error) {
        console.error("Error fetching user data for rank card:", error);
        throw new Error("Failed to retrieve user data.");
    }
    
    const { exp, name } = userData;
	const levelUser = expToLevel(exp, deltaNext);
	const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
	const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);
    
    const totalUsers = await Users.countDocuments();
    const rankUsers = await Users.countDocuments({ exp: { $gt: exp } });
    const rank = rankUsers + 1;

	let isVip = false;
	try {
		const vip = await VipUser.findOne({ uid: userID, expiredAt: { $gt: new Date() } });
		if (vip) isVip = true;
	} catch (error) {
		console.error("Error fetching VIP status:", error);
	}
    
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

	const configRankCard = { ...defaultDesignCard, ...dataLevel };
	const image = new RankCard(configRankCard);
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
		const {
			sub_color, alpha_subcard, exp_color,
			text_color, rank_color, line_color,
			exp, expNextLevel, name, level, rank, avatar, isVip 
		} = this;

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
		const edge = (heightCard / 2) * Math.tan((angleLineCenter * Math.PI) / 180);

		if (line_color) {
			if (!isUrl(line_color)) {
				ctx.fillStyle = ctx.strokeStyle = checkGradientColor(ctx, Array.isArray(line_color) ? line_color : [line_color], xyAvatar - resizeAvatar / 2 - heightLineBetween, 0, xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
				ctx.globalCompositeOperation = "source-over";
			} else {
				ctx.save();
				const img = await Canvas.loadImage(line_color);
				ctx.globalCompositeOperation = "source-over";
				ctx.beginPath();
				ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
				ctx.fill();
				ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
				ctx.fill();
				ctx.translate(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
				ctx.rotate((angleLineCenter * Math.PI) / 180);
				ctx.rect(0, 0, heightLineBetween, 1000);
				ctx.fill();
				ctx.restore();
			}
		}

		ctx.beginPath();
		if (!isUrl(line_color)) ctx.rect(xyAvatar + resizeAvatar / 2, heightCard / 2 - heightLineBetween / 2, widthLineBetween, heightLineBetween);
		ctx.fill();

		ctx.beginPath();
		if (!isUrl(line_color)) {
			ctx.moveTo(xyAvatar + resizeAvatar / 2 + widthLineBetween + edge, 0);
			ctx.lineTo(xyAvatar + resizeAvatar / 2 + widthLineBetween - edge, heightCard);
			ctx.lineWidth = heightLineBetween;
			ctx.stroke();
		}

		ctx.beginPath();
		if (!isUrl(line_color)) ctx.arc(xyAvatar, xyAvatar, resizeAvatar / 2 + heightLineBetween, 0, 2 * Math.PI);
		ctx.fill();
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillRect(0, 0, widthCard, alignRim);
		ctx.fillRect(0, heightCard - alignRim, widthCard, alignRim);

		const radius = 6 * percentage(heightCard);
		const xStartExp = (25 + 1.5) * percentage(widthCard), yStartExp = 67 * percentage(heightCard), widthExp = 40.5 * percentage(widthCard), heightExp = radius * 2;
		ctx.globalCompositeOperation = "source-over";
		
        try {
            const avatarImg = await Canvas.loadImage(avatar);
            centerImage(ctx, avatarImg, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);
        } catch(e) {
            const fallback = await Canvas.loadImage("https://i.imgur.com/eB3V1XN.png");
            centerImage(ctx, fallback, xyAvatar, xyAvatar, resizeAvatar, resizeAvatar);
        }

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
		ctx.font = autoSizeFont(18.4 * percentage(widthCard), 4 * percentage(widthCard) + this.textSize, rank, ctx, this.fontName);
		ctx.fillStyle = rank_color || text_color;
		ctx.fillText(rank, 94 * percentage(widthCard), 76 * percentage(heightCard));

		ctx.font = autoSizeFont(9.8 * percentage(widthCard), 3.25 * percentage(widthCard) + this.textSize, `Lv ${level}`, ctx, this.fontName);
		ctx.fillText(`Lv ${level}`, 94 * percentage(widthCard), 32 * percentage(heightCard));

		ctx.textAlign = "center";
		ctx.font = autoSizeFont(52.1 * percentage(widthCard), 4 * percentage(widthCard) + this.textSize, name, ctx, this.fontName);
		ctx.fillText(name, 47.5 * percentage(widthCard), 40 * percentage(heightCard));

		ctx.font = autoSizeFont(49 * percentage(widthCard), 2 * percentage(widthCard) + this.textSize, `Exp ${exp}/${expNextLevel}`, ctx, this.fontName);
		ctx.fillText(`Exp ${exp}/${expNextLevel}`, 47.5 * percentage(widthCard), 61.4 * percentage(heightCard));

		if (isVip) {
			try {
				const badgeSize = 170; 
				const vipLogoUrl = "https://i.imgur.com/zNzNEpN.jpeg";
				const vipLogo = await Canvas.loadImage(vipLogoUrl);
				const bx = widthCard - badgeSize - 530; 
				const by = heightCard / 2 - badgeSize / 2 - 100;
				ctx.save();
				ctx.beginPath();
				ctx.arc(bx + badgeSize / 2, by + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(vipLogo, bx, by, badgeSize, badgeSize);
				ctx.restore();
			} catch (err) {
				console.error("VIP badge load failed:", err);
			}
		}
        return canvas.toBuffer();
	}
}

// --- Essential Helpers ---
async function checkColorOrImageAndDraw(xStart, yStart, width, height, ctx, colorOrImage, r) {
	if (typeof colorOrImage !== 'string' || !colorOrImage.match(/^https?:\/\//)) {
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
    if (typeof string !== 'string') return false;
	try { return Boolean(new URL(string)); }
	catch (err) { return false; }
}
