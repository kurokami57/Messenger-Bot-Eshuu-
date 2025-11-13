module.exports.config = {
  name: "help",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "💖 NM Nerob",
  description: "Fully aesthetic bold-font help menu with unique emojis for each category",
  commandCategory: "🌈 System",
  usages: "",
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

// ✨ Unique emoji for each category ✨
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

// 𝗕𝗼𝗹𝗱 𝗳𝗼𝗻𝘁 𝗰𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗿
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

  // Group by category
  const categorized = {};
  for (const [name, cmd] of commands) {
    const cat = (cmd.config.commandCategory || "misc").toLowerCase();
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(name);
  }

  // Sort categories alphabetically
  const sortedCats = Object.keys(categorized).sort();
  for (const cat of sortedCats) categorized[cat].sort();

  // Total commands
  const totalCommands = Array.from(commands.keys()).length;

  // Build clean message
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
