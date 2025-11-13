module.exports.config = {
	name: "help",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "Nerob",
	description: "Beginner's Guide",
	commandCategory: "🛠️ System",
	usages: "[command name]",
	cooldowns: 1,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 300
	}
};

module.exports.languages = {
	"en": {
		"moduleInfo": "💌 Command: %1\n💭 Description: %2\n\n📝 Usage: %3\n📂 Category: %4\n⏱️ Cooldown: %5s\n🎀 Permission: %6\n\n✨ Coded by: %7",
		"helpList": '[ There are %1 commands available 💫 — use "%2help commandName" to learn more! ]',
		"user": "🌸 User",
        "adminGroup": "👑 Group Admin",
        "adminBot": "🛡️ Bot Admin"
	}
};

module.exports.handleEvent = function ({ api, event, getText }) {
	const { commands } = global.client;
	const { threadID, messageID, body } = event;

	if (!body || typeof body !== "string" || !body.toLowerCase().startsWith("help")) return;
	const splitBody = body.trim().split(/\s+/);
	if (splitBody.length === 1 || !commands.has(splitBody[1].toLowerCase())) return;

	const command = commands.get(splitBody[1].toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	return api.sendMessage(
		getText(
			"moduleInfo",
			command.config.name,
			command.config.description,
			`${prefix}${command.config.name} ${command.config.usages || ""}`,
			command.config.commandCategory,
			command.config.cooldowns,
			command.config.hasPermssion === 0
				? getText("user")
				: command.config.hasPermssion === 1
				? getText("adminGroup")
				: getText("adminBot"),
			command.config.credits
		),
		threadID,
		messageID
	);
};

module.exports.run = async function({ api, event, args, getText }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((args[0] || "").toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
	const prefix = threadSetting.PREFIX || global.config.PREFIX;

	// 🌷 Command Detail
	if (command) {
		return api.sendMessage(
			getText(
				"moduleInfo",
				command.config.name,
				command.config.description,
				`${prefix}${command.config.name} ${command.config.usages || ""}`,
				command.config.commandCategory,
				command.config.cooldowns,
				command.config.hasPermssion === 0
					? getText("user")
					: command.config.hasPermssion === 1
					? getText("adminGroup")
					: getText("adminBot"),
				command.config.credits
			),
			threadID,
			messageID
		);
	}

	// 📚 Full Command List
	const arrayInfo = [];
	const page = parseInt(args[0]) || 1;
	const numberOfOnePage = 10;
	let i = 0;
	let msg = "";

	for (const [name] of commands) {
		arrayInfo.push(name);
	}
	arrayInfo.sort();

	const startSlice = numberOfOnePage * page - numberOfOnePage;
	i = startSlice;
	const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

	for (let item of returnArray) {
		msg += `🌸 ${++i}. ${prefix}${item}\n`;
	}

	const header = `🌸💖 𝓗𝓮𝓵𝓵𝓸 𝓫𝓮𝓪𝓾𝓽𝔂~ 𝓱𝓮𝓻𝓮'𝓼 𝔂𝓸𝓾𝓻 𝓬𝓾𝓽𝓮 𝓬𝓸𝓶𝓶𝓪𝓷𝓭 𝓶𝓮𝓷𝓾 💖🌸`;
	const footer = `✨━━━━━━━━━━━━━━━━━━✨`;
	const pageInfo = `📄 Page: ${page}/${Math.ceil(arrayInfo.length / numberOfOnePage)}`;
	const note = `\n📎 Use: \`${prefix}help commandName\` for more info`;

	return api.sendMessage(
		`${header}\n\n💫 Total Commands: ${arrayInfo.length}\n\n${msg}\n${footer}\n${pageInfo}${note}`,
		threadID,
		async (err, info) => {
			if (autoUnsend) {
				await new Promise(res => setTimeout(res, delayUnsend * 1000));
				return api.unsendMessage(info.messageID);
			}
		},
		messageID
	);
};
