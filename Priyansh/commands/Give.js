module.exports.config = {
  name: "give",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Nerob",
  description: "Give money to someone",
  commandCategory: "Economy",
  usages: "@tag amount | reply amount",
  cooldowns: 3
};

module.exports.run = async ({ api, event, Currencies, Users }) => {

  let targetID;
  const args = event.body.split(" ");

  // 📌 1. If tag user
  if (Object.keys(event.mentions).length > 0) {
    targetID = Object.keys(event.mentions)[0];
  }

  // 📌 2. If reply to someone
  else if (event.type === "message_reply") {
    targetID = event.messageReply.senderID;
  }

  // 📌 3. If no target user
  else {
    return api.sendMessage("❌ Tag or reply to someone to give money.", event.threadID);
  }

  // 📌 Amount check
  const amount = parseInt(args[2]);
  if (!amount || isNaN(amount) || amount <= 0)
    return api.sendMessage("❌ Enter a valid amount.", event.threadID);

  const sender = event.senderID;

  if (sender == targetID)
    return api.sendMessage("❌ You cannot send money to yourself!", event.threadID);

  const senderData = await Currencies.getData(sender);

  if (!senderData || senderData.money < amount)
    return api.sendMessage("❌ Not enough balance.", event.threadID);

  // Transfer money
  await Currencies.decreaseMoney(sender, amount);
  await Currencies.increaseMoney(targetID, amount);

  const name = await Users.getNameUser(targetID);

  api.sendMessage(
    `✅ You sent ${global.formatMoney(amount)} to ${name}.`,
    event.threadID,
    event.messageID
  );
};
