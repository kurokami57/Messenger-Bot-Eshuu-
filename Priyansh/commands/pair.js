const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "pair",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Nerob + ChatGPT (Canvas Buffer Edition)",
  description: "Pairs you using canvas without saving any files",
  commandCategory: "love",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  try {
    const sender = event.senderID;
    const senderName = await Users.getNameUser(sender);
    const botID = api.getCurrentUserID();

    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;

    let senderGender = all.find(u => u.id == sender)?.gender || null;

    // Filter opposite gender users
    let candidates = all.filter(u =>
      u.id !== sender &&
      u.id !== botID &&
      u.gender !== undefined &&
      u.gender !== null
    );

    if (senderGender === "MALE") {
      candidates = candidates.filter(u => u.gender === "FEMALE");
    } else if (senderGender === "FEMALE") {
      candidates = candidates.filter(u => u.gender === "MALE");
    }

    // fallback
    if (candidates.length === 0)
      candidates = all.filter(u => u.id !== sender && u.id !== botID);

    if (candidates.length === 0)
      return api.sendMessage("❌ No partner found.", event.threadID);

    // Random partner
    const partner = candidates[Math.floor(Math.random() * candidates.length)];
    const partnerName = await Users.getNameUser(partner.id);

    // Compatibility
    let compatibility = Math.floor(Math.random() * 100) + 1;

    // Special infinite pair
    const specialFemale = "61582396625334";
    const specialMale = "61557548527867";

    if (
      (sender === specialFemale && partner.id === specialMale) ||
      (sender === specialMale && partner.id === specialFemale)
    ) {
      compatibility = "♾️";
    }

    // Captions
    const captions = [
      "💞 𝑺𝒕𝒂𝒓𝒔 𝒂𝒍𝒊𝒈𝒏𝒆𝒅!",
      "✨ 𝑨 𝒑𝒆𝒓𝒇𝒆𝒄𝒕 𝒗𝒊𝒃𝒆!",
      "❤️ 𝑺𝒘𝒆𝒆𝒕 𝒍𝒐𝒗𝒆 𝒎𝒂𝒕𝒄𝒉!",
      "💘 𝑩𝒍𝒆𝒔𝒔𝒆𝒅 𝒑𝒂𝒊𝒓!",
      "🔥 𝑨𝒕𝒕𝒓𝒂𝒄𝒕𝒊𝒐𝒏 𝒊𝒔 𝒓𝒆𝒂𝒍!"
    ];
    const caption = captions[Math.floor(Math.random() * captions.length)];

    // Background
    const bgURL = "https://i.imgur.com/P8ATVjE.jpeg";
    const bgImg = await loadImage(bgURL);

    // Avatars
    const avt1 = await loadImage(
      `https://graph.facebook.com/${sender}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
    );

    const avt2 = await loadImage(
      `https://graph.facebook.com/${partner.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
    );

    // Canvas
    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const size = 150;

    // Draw circular avatar
    function drawCircle(img, x, y, s) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, y, s, s);
      ctx.restore();
    }

    drawCircle(avt1, 120, 120, size);
    drawCircle(avt2, canvas.width - size - 120, 120, size);

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png");

    // Send message
    return api.sendMessage(
      {
        body:
`${caption}

💞 **Paired:** ${senderName} × ${partnerName}
🎯 **Compatibility:** ${compatibility}${compatibility === "♾️" ? "" : "%"}

😍 Love match generated!`,
        attachment: buffer,
        mentions: [{ tag: partnerName, id: partner.id }]
      },
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Pair error: " + err.message, event.threadID);
  }
};
