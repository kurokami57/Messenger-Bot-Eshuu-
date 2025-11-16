const fs = require("fs-extra");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports.config = {
  name: "pair",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Nerob",
  description: "Randomly pairs you with someone in the group with a fun compatibility percentage.",
  commandCategory: "fun",
  usages: "",
  cooldowns: 15,
  dependencies: {
    axios: "",
    "fs-extra": "",
    canvas: ""
  }
};

module.exports.run = async function ({ args, Users, Threads, api, event }) {
  const pathImg = path.join(__dirname, "cache/pairing_eren.png");
  const pathAvtMale = path.join(__dirname, "cache/AvtMale.png");
  const pathAvtFemale = path.join(__dirname, "cache/AvtFemale.png");

  const id1 = event.senderID;
  const name1 = await Users.getNameUser(id1);
  const threadInfo = await api.getThreadInfo(event.threadID);
  const all = threadInfo.userInfo;

  const botID = api.getCurrentUserID();
  const user1Info = all.find(u => u.id == id1);
  let gender1 = user1Info?.gender;

  let candidates = all.filter(u => u.id !== id1 && u.id !== botID);
  let idMale, idFemale, nameMale, nameFemale;

  // Match based on gender
  if (gender1 === "FEMALE") {
    idFemale = id1;
    const males = candidates.filter(u => u.gender === "MALE");
    if (males.length === 0) {
      return api.sendMessage("❌ Couldn't find a male match for you in this group.", event.threadID, event.messageID);
    }
    idMale = males[Math.floor(Math.random() * males.length)].id;
  } else {
    idMale = id1;
    const females = candidates.filter(u => u.gender === "FEMALE");
    if (females.length === 0) {
      return api.sendMessage("❌ Couldn't find a female match for you in this group.", event.threadID, event.messageID);
    }
    idFemale = females[Math.floor(Math.random() * females.length)].id;
  }

  nameMale = await Users.getNameUser(idMale);
  nameFemale = await Users.getNameUser(idFemale);

  const percentage = Math.floor(Math.random() * 101);
  const backgrounds = [
    "https://i.postimg.cc/XYfV5VKN/pairing-eren.jpg"
    // Add more backgrounds if needed
  ];
  const backgroundUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  const getAvatar = async (userID, filePath) => {
    const url = `https://graph.facebook.com/${userID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarData = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(avatarData, "utf-8"));
  };

  await getAvatar(idMale, pathAvtMale);
  await getAvatar(idFemale, pathAvtFemale);

  const bgData = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathImg, Buffer.from(bgData, "utf-8"));

  // Create canvas
  const baseImage = await loadImage(pathImg);
  const baseAvtMale = await loadImage(pathAvtMale);
  const baseAvtFemale = await loadImage(pathAvtFemale);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  // Drawing avatars at new positions
  ctx.drawImage(baseAvtMale, 60, 300, 150, 150);
  ctx.drawImage(baseAvtFemale, 500, 300, 150, 150);

  const finalImage = canvas.toBuffer();
  fs.writeFileSync(pathImg, finalImage);

  fs.removeSync(pathAvtMale);
  fs.removeSync(pathAvtFemale);

  return api.sendMessage({
    body: `💞 Congratulations, ${nameMale} has been paired with ${nameFemale}!\n💘 Compatibility: ${percentage}%`,
    mentions: [{ tag: nameMale, id: idMale }, { tag: nameFemale, id: idFemale }],
    attachment: fs.createReadStream(pathImg)
  }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
};
