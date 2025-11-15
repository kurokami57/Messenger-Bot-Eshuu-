const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "pair",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Nerob + Fixed by ChatGPT",
  description: "Pairs you with someone of opposite gender with canvas image",
  commandCategory: "love",
  usages: "",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  try {
    // === Ensure folders exist ===
    const cacheCanvas = __dirname + "/cache/canvas";
    if (!fs.existsSync(cacheCanvas)) fs.mkdirSync(cacheCanvas, { recursive: true });

    const pathBG = __dirname + "/cache/canvas/pair.jpg";
    const pathAvt1 = __dirname + "/cache/canvas/avt1.png";
    const pathAvt2 = __dirname + "/cache/canvas/avt2.png";
    const pathFinal = __dirname + "/cache/canvas/pairing.png";

    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;

    const sender = event.senderID;
    const senderName = await Users.getNameUser(sender);
    const botID = api.getCurrentUserID();

    let senderGender = all.find(u => u.id == sender)?.gender || null;

    // === FILTER FOR OPPOSITE GENDER ===
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

    // fallback if no opposite gender
    if (candidates.length === 0) {
      candidates = all.filter(u => u.id !== sender && u.id !== botID);
    }

    if (candidates.length === 0)
      return api.sendMessage("❌ No valid partner found.", event.threadID, event.messageID);

    // pick random partner
    const partner = candidates[Math.floor(Math.random() * candidates.length)];
    const partnerName = await Users.getNameUser(partner.id);

    // === COMPATIBILITY ===
    const specialFemale = "61582396625334";
    const specialMale = "61557548527867";

    let compatibility = Math.floor(Math.random() * 100) + 1;
    if (
      (sender === specialFemale && partner.id === specialMale) ||
      (sender === specialMale && partner.id === specialFemale)
    ) {
      compatibility = "♾️";
    }

    // === CAPTION ===
    const captions = [
      "💞 𝑺𝒕𝒂𝒓𝒔 𝒂𝒍𝒊𝒈𝒏𝒆𝒅!",
      "✨ 𝑨 𝒑𝒆𝒓𝒇𝒆𝒄𝒕 𝒗𝒊𝒃𝒆!",
      "❤️ 𝑺𝒘𝒆𝒆𝒕 𝒍𝒐𝒗𝒆 𝒎𝒂𝒕𝒄𝒉!",
      "💘 𝑩𝒍𝒆𝒔𝒔𝒆𝒅 𝒑𝒂𝒊𝒓!",
      "🔥 𝑨𝒕𝒕𝒓𝒂𝒄𝒕𝒊𝒐𝒏 𝒊𝒔 𝒓𝒆𝒂𝒍!"
    ];
    const caption = captions[Math.floor(Math.random() * captions.length)];

    // === BACKGROUND IMAGE ===
    const bgURL = "https://i.imgur.com/P8ATVjE.jpeg";

    const bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathBG, Buffer.from(bgData));

    // === FETCH AVATARS ===
    const avt1 = (
      await axios.get(
        `https://graph.facebook.com/${sender}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(avt1));

    const avt2 = (
      await axios.get(
        `https://graph.facebook.com/${partner.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(avt2));

    // === CANVAS ===
    const bgImg = await loadImage(pathBG);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);

    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const size = 150;

    // === CIRCULAR AVATAR DRAW FUNCTION ===
    function drawCircleImage(img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }

    // Place avatars
    drawCircleImage(avatar1, 100, 100, size);
    drawCircleImage(avatar2, 450, 100, size);

    fs.writeFileSync(pathFinal, canvas.toBuffer());

    return api.sendMessage(
      {
        body:
`${caption}

💞 **Paired:** ${senderName} × ${partnerName}
🎯 **Compatibility:** ${compatibility}${compatibility === "♾️" ? "" : "%"}`,
        attachment: fs.createReadStream(pathFinal),
        mentions: [{ tag: partnerName, id: partner.id }],
      },
      event.threadID,
      () => {
        // cleanup
        fs.removeSync(pathFinal);
        fs.removeSync(pathBG);
        fs.removeSync(pathAvt1);
        fs.removeSync(pathAvt2);
      },
      event.messageID
    );

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Error in pair command: " + err.message, event.threadID, event.messageID);
  }
};
