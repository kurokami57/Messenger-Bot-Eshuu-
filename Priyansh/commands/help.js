module.exports.config = {
  name: "help",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "💖 NM Nerob",
  description: "Fully aesthetic bold-font help menu with unique emojis for each category and detailed command info",
  commandCategory: "🌈 System",
  usages: "[commandName]",
  cooldowns: 1,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 300
  }
};

module.exports.languages = {
  "en": {
    "header": "🌸 𝗛𝗶! 𝐇𝐞𝐲, 𝗵𝗲𝗿𝗲’𝘀 𝘆𝗼𝘂𝗿 𝗯𝗼𝘁’𝘀 𝗮𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗹𝗶𝘀𝘁 ✨",
    "footer": "💖 𝐂𝐫𝐞𝐚𝐭𝐨𝐫: 𝐍𝐌 𝐍𝐞𝐫𝐨𝐛 💖",
    "usageNote": "📖 𝗨𝘀𝗲 `/help commandName` 𝘁𝗼 𝘀𝗲𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀"
  }
};

// Unique emoji for each category
const categoryEmojis = {
  "system": "⚙️",
  "admin": "👑",
  "fun": "🎉",
  "entertainment": "🎬",
  "economy": "💰",
  "game": "🎮",
  "social": "💌",
  "tools": "🧰",
  "utility": "🪄",
  "information": "📚",
  "ai": "🤖",
  "music": "🎧",
  "photo": "📸",
  "anime": "🌸",
  "love": "🎀",
  "moderation": "🛡️",
  "nsfw": "🔥",
  "random": "🍓",
  "others": "✨",
  "misc": "🌷"
};

// Bold font converter
function boldify(text) {
  const map = {
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",
    n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
    A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",K:"𝗞",L:"𝗟",
    M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",
    Y:"𝗬",Z:"𝗭"," ":" ","/":"/",".":".",",":",","!":"!","?":"?","'":"'" 
  };
  return text.split("").map(c => map[c] || c).join("");
}

module.exports.run = async function({ api, event, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const args = event.body.split(" ").slice(1);
  const cmdName = args[0]?.toLowerCase();

  // If user asked for specific command
  if (cmdName) {
    let cmd = null;
    for (const [name, command] of commands) {
      if (name.toLowerCase() === cmdName || (command.config.aliases || []).map(a=>a.toLowerCase()).includes(cmdName)) {
        cmd = command;
        break;
      }
    }
    if (!cmd) return api.sendMessage(`❌ Command "${cmdName}" not found.`, threadID, messageID);

    const cfg = cmd.config;
    const msg = `✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗗𝗲𝘁𝗮𝗶𝗹 ✨\n\n` +
                `• 𝗡𝗮𝗺𝗲: ${boldify(cfg.name)}\n` +
                `• 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${boldify((cfg.aliases||[]).join(", ") || "None")}\n` +
                `• 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${boldify(cfg.description || "None")}\n` +
                `• 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${boldify(cfg.commandCategory || "misc")}\n` +
                `• 𝗨𝘀𝗮𝗴𝗲: ${boldify(cfg.usages || "No usage")}\n` +
                `• 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${boldify(cfg.cooldowns?.toString() || "0")}s\n` +
                `• 𝗖𝗿𝗲𝗱𝗶𝘁𝘀: ${boldify(cfg.credits || "None")}`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // Otherwise, show full aesthetic help list
  const categorized = {};
  for (const [name, cmd] of commands) {
    const cat = (cmd.config.commandCategory || "misc").toLowerCase();
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(name);
  }

  const sortedCats = Object.keys(categorized).sort();
  for (const cat of sortedCats) categorized[cat].sort();

  const totalCommands = Array.from(commands.keys()).length;

  let msg = `${getText("header")}\n\n`;
  msg += `✨ ${boldify("𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬")}: ${totalCommands}\n\n`;

  for (const cat of sortedCats) {
    const emoji = categoryEmojis[cat] || "💫";
    msg += `${emoji} ${boldify(cat.charAt(0).toUpperCase() + cat.slice(1))}\n`;
    for (const cmdName of categorized[cat]) {
      msg += `• ${boldify("/" + cmdName)}\n`;
    }
    msg += "\n";
  }

  msg += `${getText("footer")}\n${getText("usageNote")}`;
  return api.sendMessage(msg, threadID, messageID);
};
