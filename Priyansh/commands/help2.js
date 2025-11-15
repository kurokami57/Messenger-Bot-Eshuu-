module.exports.config = {
  name: "bal",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Nerob",
  description: "Show balance for yourself or others",
  commandCategory: "Economy",
  usages: "@tag / reply / self",
  cooldowns: 1
};

module.exports.run = async ({ api, event, Users, Currencies }) => {

  let targetID;

  // 📌 1. If user tagged someone
  if (Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  }

  // 📌 2. If user replied to someone
  else if (event.type === "message_reply") {
    targetID = event.messageReply.senderID;
  }

  // 📌 3. Default → user checks own balance
  else {
    targetID = event.senderID;
  }

  // Get data
  const data = await Currencies.getData(targetID);
  if (!data) return api.sendMessage("❌ This user has no account.", event.threadID);

  const money = data.money || 0;

  // Get user name
  const name = await Users.getNameUser(targetID);

  // Send formatted message
  return api.sendMessage(
    `📛 Name: ${name}\n💼 Balance: ${global.formatMoney(money)}`,
    event.threadID,
    event.messageID
  );
};
