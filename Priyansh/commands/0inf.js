module.exports.config = {
	name: "inf",
	version: "1.0.3",
	hasPermssion: 0,
	credits: "Nerob",
	description: "Aesthetic Admin & Bot Info",
	commandCategory: "info",
	cooldowns: 1,
	dependencies: {
		"request": "",
		"fs-extra": "",
		"axios": ""
	}
};

module.exports.run = async function({ api, event }) {
	const request = global.nodemodule["request"];
	const fs = global.nodemodule["fs-extra"];
	const moment = require("moment-timezone");

	const time = process.uptime();
	const hours = Math.floor(time / (60 * 60));
	const minutes = Math.floor((time % (60 * 60)) / 60);
	const seconds = Math.floor(time % 60);
	const dateNow = moment.tz("Asia/Kolkata").format("『DD/MM/YYYY』 【HH:mm:ss】");

	// 🖼️ Use Facebook profile pic
	const fbID = "61557548527867";
	const fbPic = `https://graph.facebook.com/${fbID}/picture?width=720&height=720`;

	const callback = () => api.sendMessage({
		body: `✨ 𝗔𝗗𝗠𝗜𝗡 𝗔𝗡𝗗 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ✨


⚜️ 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 ⚜️  
➥ 𝗕𝗢𝗧: **${global.config.BOTNAME}**

🔥 𝗢𝗪𝗡𝗘𝗥 🔥  
➥ **𝗡𝗲𝗿𝗼𝗯**

📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗟𝗜𝗡𝗞 📞  
➥ 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: [𝗖𝗹𝗶𝗰𝗸 𝗛𝗲𝗿𝗲](https://www.facebook.com/${fbID})

🌸 𝗕𝗢𝗧 𝗣𝗥𝗘𝗙𝗜𝗫 🌸  
➥ **${global.config.PREFIX}**

🕒 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 🕒  
➥ ${dateNow}

⚡ 𝗨𝗣𝗧𝗜𝗠𝗘 ⚡  
➥ ${hours}𝗵 ${minutes}𝗺 ${seconds}𝘀

💖 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 **${global.config.BOTNAME}** 💖

✧══════•❁❀❁•══════✧`,
		attachment: fs.createReadStream(__dirname + "/cache/nerob.jpg")
	}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/nerob.jpg"));

	// Download your FB profile picture
	request(encodeURI(fbPic))
		.pipe(fs.createWriteStream(__dirname + "/cache/nerob.jpg"))
		.on("close", () => callback());
};
