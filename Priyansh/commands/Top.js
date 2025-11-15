module.exports.config = {
  name: "top",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Nerob",
  description: "Top richest users",
  commandCategory: "Economy",
  usages: "top | topbal | topbalance",
  aliases: ["topbal", "topbalance"],
  cooldowns: 2
};

function formatShort(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9)  return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6)  return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3)  return (num / 1e3).toFixed(2) + "K";
  return num.toString();
}

module.exports.run = async ({ api, event, Currencies, Users }) => {
  
  const all = await Currencies.getAll();
  all.sort((a, b) => b.money - a.money);

  let msg = "💰 TOP 10 RICHEST USERS 💰\n\n";

  let count = 0;
  for (const user of all.slice(0, 10)) {
    count++;
    const name = await Users.getNameUser(user.userID);

    const shortMoney = formatShort(user.money); 
    const finalMoney = `${global.currencySymbol}${shortMoney} ${global.currencyName}`;

    msg += `${count}. ${name} — ${finalMoney}\n`;
  }

  api.sendMessage(msg, event.threadID, event.messageID);
};
