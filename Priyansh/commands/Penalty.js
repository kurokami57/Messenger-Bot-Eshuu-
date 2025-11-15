module.exports.config = {
  name: "penalty",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "You",
  description: "Interactive penalty game: bet money and choose direction",
  commandCategory: "Games",
  usages: "penalty <amount>",
  cooldowns: 3
};

const players = ["ronaldo", "messi"];
const directions = ["left", "middle", "right"];
const images = {
  ronaldo_shot: "https://i.imgur.com/KXWssLy.jpeg",
  ronaldo_goal: "https://i.imgur.com/fm1qo6W.jpeg",
  ronaldo_miss: "https://i.imgur.com/0Y1ZDAx.jpeg",
  messi_shot: "https://i.imgur.com/WYDMoTm.jpeg",
  messi_goal: "https://i.imgur.com/EgjxcZC.jpeg",
  messi_miss: "https://i.imgur.com/CXoeCMP.jpeg"
};

module.exports.run = async ({ api, event, Currencies }) => {
  const args = event.body.split(" ");
  const userID = event.senderID;

  if (!args[1] || isNaN(args[1]))
    return api.sendMessage("⚠️ Enter a valid bet amount.\nExample: penalty 10000", event.threadID);

  const amount = parseInt(args[1]);
  const userData = await Currencies.getData(userID);
  if (!userData || userData.money < amount)
    return api.sendMessage("❌ Not enough balance!", event.threadID);

  // Randomly pick player
  const chosenPlayer = players[Math.floor(Math.random() * players.length)];
  const shotImage = chosenPlayer === "ronaldo" ? images.ronaldo_shot : images.messi_shot;

  // Step 1: ask user for direction
  api.sendMessage({
    body: `⚽ ${chosenPlayer.toUpperCase()} is ready to take the penalty!\nReply with your shot direction:\nLeft / Middle / Right (or L/M/R)`,
    attachment: await global.utils.getStreamFromURL(shotImage)
  }, event.threadID, async (err, info) => {
    if (err) return;

    // Wait for reply
    const handleReply = async (replyEvent) => {
      if (replyEvent.senderID !== userID || !replyEvent.messageReply || replyEvent.messageReply.messageID !== info.messageID) return;

      let choice = replyEvent.body.toLowerCase();
      if (choice === "l") choice = "left";
      if (choice === "m") choice = "middle";
      if (choice === "r") choice = "right";

      if (!directions.includes(choice)) {
        api.sendMessage("❌ Invalid choice! Reply with Left / Middle / Right (or L/M/R).", event.threadID);
        return;
      }

      // Keeper random
      const keeper = directions[Math.floor(Math.random() * directions.length)];

      if (choice === keeper) {
        // MISS
        await Currencies.decreaseMoney(userID, amount);
        const missImage = chosenPlayer === "ronaldo" ? images.ronaldo_miss : images.messi_miss;

        api.sendMessage({
          body: `❌ Saved!\nYour shot: ${choice}\nKeeper guessed: ${keeper}\nYou lost 💵 ${amount}`,
          attachment: await global.utils.getStreamFromURL(missImage)
        }, event.threadID);

      } else {
        // GOAL
        const reward = amount * 3;
        await Currencies.increaseMoney(userID, reward);
        const goalImage = chosenPlayer === "ronaldo" ? images.ronaldo_goal : images.messi_goal;

        api.sendMessage({
          body: `🎉 GOAL!\nYour shot: ${choice}\nKeeper guessed: ${keeper}\nYou won 💵 ${reward} (3x)`,
          attachment: await global.utils.getStreamFromURL(goalImage)
        }, event.threadID);
      }

      // Remove listener after one reply
      api.unsend(handleReply);
    };

    api.listen("message", handleReply); // Listen for reply
  });
};
