const fs = require("fs-extra");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "pair",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Nerob + ChatGPT",
  description: "Pair you with someone using canvas (file version)",
  commandCategory: "love",
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  try {
    // ===== Create cache/pair folder =====
    const dir = __dirname + "/cache/pair";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const bgPath = `${dir}/bg.jpg`;
    const avt1Path = `${dir}/avt1.jpg`;
    const avt2Path = `${dir}/avt2.jpg`;
    const finalPath = `${dir}/final.png`;

    // ===== Get group users =====
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;

    const sender = event.senderID;
    const botID = api.getCurrentUserID();
    const senderName = await Users.getNameUser(sender);

    let senderGender = all.find(u => u.id == sender)?.gender || null;

    // ===== Filter candidates =====
    let candidates = all.filter(u =>
      u.id !== sender &&
      u.id !== botID &&
      u.gender !== undefined &&
      u.gender !== null
    );

    if (senderGender === "MALE") candidates = candidates.filter(u => u.gender === "FEMALE");
    else if (senderGender === "FEMALE") candidates = candidates.filter(u => u.gender === "MALE");

    // fallback
    if (candidates.length === 0) candidates = all.filter(u => u.id !== sender && u.id !== botID);

    if (candidates.length === 0)
      return api.sendMessage("❌ No partner found.", event.threadID);

    // ===== Pick partner =====
    const partner = candidates[Math.floor(Math.random() * candidates.length)];
    const partnerName = await Users.getNameUser(partner.id);

    // ===== Compatibility =====
    let compatibility = Math.floor(Math.random() * 100) + 1;
    const specialFemale = "61582396625334";
    const specialMale = "61557548527867";
    if ((sender === specialFemale && partner.id === specialMale) ||
        (sender === specialMale && partner.id === specialFemale)) {
      compatibility = "♾️";
    }

    // ===== Captions =====
    const captions = [
      "💞 𝑺𝒕𝒂𝒓𝒔 𝒂𝒍𝒊𝒈𝒏𝒆𝒅!",
      "✨ 𝑨 𝒑𝒆𝒓𝒇𝒆𝒄𝒕 𝒗𝒊𝒃𝒆!",
      "❤️ 𝑺𝒘𝒆𝒆𝒕 𝒍𝒐𝒗𝒆 𝒎𝒂𝒕𝒄𝒉!",
      "💘 𝑩𝒍𝒆𝒔𝒔𝒆𝒅 𝒑𝒂𝒊𝒓!",
      "🔥 𝑨𝒕𝒕𝒓𝒂𝒄𝒕𝒊𝒐𝒏 𝒊𝒔 𝒓𝒆𝒂𝒍!"
    ];
    const caption = captions[Math.floor(Math.random() * captions.length)];

    // ===== Download background =====
    const bgURL = "https://i.imgur.com/P8ATVjE.jpeg";
    const bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgData));

    // ===== Download avatars =====
    const avt1 = (await axios.get(
      `https://graph.facebook.com/${sender}/picture?width=720&height=720`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(avt1Path, Buffer.from(avt1));

    const avt2 = (await axios.get(
      `https://graph.facebook.com/${partner.id}/picture?width=720&height=720`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(avt2Path, Buffer.from(avt2));

    // ===== Create canvas =====
    const bgImg = await loadImage(bgPath);
    const avatar1 = await loadImage(avt1Path);
    const avatar2 = await loadImage(avt2Path);

    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const size = 150;
    function drawCircle(img, x, y, s) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, y, s, s);
      ctx.restore();
    }

    drawCircle(avatar1, 100, 100, size);
    drawCircle(avatar2, canvas.width - size - 100, 100, size);

    // Save final canvas
    fs.writeFileSync(finalPath, canvas.toBuffer());

    // ===== Send message =====
    return api.sendMessage(
      {
        body:
`${caption}

💞 **Paired:** ${senderName} × ${partnerName}
🎯 **Compatibility:** ${compatibility}${compatibility === "♾️" ? "" : "%"}

😍 Beautiful love match!`,
        attachment: fs.createReadStream(finalPath),
        mentions: [{ tag: partnerName, id: partner.id }]
      },
      event.threadID,
      () => {
        // Cleanup
        fs.unlinkSync(bgPath);
        fs.unlinkSync(avt1Path);
        fs.unlinkSync(avt2Path);
        fs.unlinkSync(finalPath);
      },
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Error: " + err.message, event.threadID);
  }
};
