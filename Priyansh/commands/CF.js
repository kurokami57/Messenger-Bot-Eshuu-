module.exports.config = {
  name: "coinflip",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "You",
  description: "Coinflip game with 30% win chance",
  commandCategory: "Economy",
  usages: "coinflip <amount> heads/tails",
  cooldowns: 3
};

module.exports.run = async ({ api, event, Currencies }) => {
  const args = event.body.split(" ");

  if (!args[1] || isNaN(args[1]))
    return api.sendMessage("Enter a valid amount.", event.threadID);

  const amount = parseInt(args[1]);

  if (!args[2])
    return api.sendMessage("Choose heads or tails.", event.threadID);

  const choice = args[2].toLowerCase();
  if (choice !== "heads" && choice !== "tails")
    return api.sendMessage("Choice must be heads or tails.", event.threadID);

  const userID = event.senderID;
  const userData = await Currencies.getData(userID);

  if (userData.money < amount)
    return api.sendMessage("Not enough balance.", event.threadID);

  // 🎯 30% win — 70% lose
  let winChance = Math.random() < 0.30; // 30% true, 70% false

  // Fake flip side (only for visual effect)
  const result = Math.random() < 0.5 ? "heads" : "tails";

  if (winChance) {
    // WIN
    await Currencies.increaseMoney(userID, amount);

    return api.sendMessage(
      `💵 Coin flipped: ${result.toUpperCase()}\n🎉 You WON ${global.formatMoney(amount)}!`,
      event.threadID
    );
  } else {
    // LOSE
    await Currencies.decreaseMoney(userID, amount);

    return api.sendMessage(
      `💵 Coin flipped: ${result.toUpperCase()}\n❌ You LOST ${global.formatMoney(amount)}!`,
      event.threadID
    );
  }
};
