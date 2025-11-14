module.exports.config = {
  name: "pair",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + Nerob Upgrade",
  description: "Compatibility pairing",
  commandCategory: "Giải trí",
  usages: "",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 0
}

module.exports.run = async function ({ args, Users, Threads, api, event }) {

  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];

  let pathImg = __dirname + "/cache/background.png";
  let pathAvt1 = __dirname + "/cache/avt1.png";
  let pathAvt2 = __dirname + "/cache/avt2.png";

  var id1 = event.senderID;
  var name1 = await Users.getNameUser(id1);

  var threadInfo = await api.getThreadInfo(event.threadID);
  var all = threadInfo.userInfo;

  let gender1;
  for (let u of all) if (u.id == id1) gender1 = u.gender;

  const botID = api.getCurrentUserID();
  let selected = [];

  if (gender1 === "FEMALE") {
    selected = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
  } else if (gender1 === "MALE") {
    selected = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
  } else {
    selected = all.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
  }

  var id2 = selected[Math.floor(Math.random() * selected.length)];
  var name2 = await Users.getNameUser(id2);

  // SPECIAL FIXED PAIR LOGIC
  const femaleID = "61582396625334";
  const maleID   = "61557548527867";

  let compatibility = Math.floor(Math.random() * 100) + 1;

  let isInfinity = false;
  if ((id1 === femaleID && id2 === maleID) || (id1 === maleID && id2 === femaleID)) {
    compatibility = "♾️";
    isInfinity = true;
  }

  // CAPTIONS
  let normalCaptions = [
    "💞 𝑺𝒕𝒂𝒓𝒔 𝒂𝒍𝒊𝒈𝒏𝒆𝒅, 𝒉𝒆𝒂𝒓𝒕𝒔 𝒄𝒐𝒏𝒏𝒆𝒄𝒕𝒆𝒅!",
    "✨ 𝑨 𝒑𝒆𝒓𝒇𝒆𝒄𝒕 𝒗𝒊𝒃𝒆 𝒎𝒂𝒕𝒄𝒉!",
    "❤️ 𝑨 𝒔𝒘𝒆𝒆𝒕 𝒄𝒉𝒂𝒏𝒄𝒆 𝒐𝒇 𝒍𝒐𝒗𝒆!",
    "💗 𝑨 𝒃𝒍𝒆𝒔𝒔𝒆𝒅 𝒑𝒂𝒊𝒓𝒊𝒏𝒈!",
    "💘 𝑳𝒐𝒗𝒆 𝒓𝒂𝒅𝒊𝒂𝒕𝒆𝒔 𝒃𝒆𝒕𝒘𝒆𝒆𝒏 𝒕𝒉𝒆𝒎!",
    "💖 𝑨 𝒑𝒖𝒓𝒆 𝒂𝒏𝒅 𝒔𝒐𝒇𝒕 𝒄𝒐𝒏𝒏𝒆𝒄𝒕𝒊𝒐𝒏!",
    "🌸 𝑯𝒆𝒂𝒓𝒕𝒔 𝒇𝒊𝒏𝒅 𝒕𝒉𝒆𝒊𝒓 𝒘𝒂𝒚!",
    "🔥 𝑨𝒕𝒕𝒓𝒂𝒄𝒕𝒊𝒐𝒏 𝒊𝒔 𝒓𝒆𝒂𝒍!",
    "🌙 𝑭𝒂𝒕𝒆 𝒇𝒐𝒓𝒎𝒔 𝒔𝒐𝒎𝒆 𝒃𝒆𝒂𝒖𝒕𝒚!",
    "💫 𝑷𝒆𝒓𝒇𝒆𝒄𝒕 𝒆𝒏𝒆𝒓𝒈𝒚 𝒗𝒊𝒃𝒆!",
    "❤️‍🔥 𝑨 𝒄𝒉𝒂𝒓𝒎𝒊𝒏𝒈 𝒃𝒐𝒏𝒅!"
  ];

  let infinityCaption =
    "💝 𝑻𝒘𝒐 𝒔𝒐𝒖𝒍𝒔, 𝒐𝒏𝒆 𝒅𝒆𝒔𝒕𝒊𝒏𝒚 — 𝒂 𝒍𝒐𝒗𝒆 𝒕𝒉𝒂𝒕’𝒔 𝒆𝒕𝒆𝒓𝒏𝒂𝒍 ♾️✨";

  const caption = isInfinity
    ? infinityCaption
    : normalCaptions[Math.floor(Math.random() * normalCaptions.length)];

  // IMAGES  
  let bgLinks = [
    "https://i.postimg.cc/wjJ29HRB/background1.png",
    "https://i.postimg.cc/zf4Pnshv/background2.png",
    "https://i.postimg.cc/5tXRQ46D/background3.png"
  ];

  let selectedBG = bgLinks[Math.floor(Math.random() * bgLinks.length)];

  let avt1 = (
    await axios.get(
      `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

  let avt2 = (
    await axios.get(
      `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));

  let bg = (
    await axios.get(selectedBG, { responseType: "arraybuffer" })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

  let baseBG = await loadImage(pathImg);
  let baseA1 = await loadImage(pathAvt1);
  let baseA2 = await loadImage(pathAvt2);

  let canvas = createCanvas(baseBG.width, baseBG.height);
  let ctx = canvas.getContext("2d");

  ctx.drawImage(baseBG, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseA1, 100, 150, 300, 300);
  ctx.drawImage(baseA2, 900, 150, 300, 300);

  fs.writeFileSync(pathImg, canvas.toBuffer());
  fs.removeSync(pathAvt1);
  fs.removeSync(pathAvt2);

  return api.sendMessage(
    {
      body:
`${caption}

✨ 𝗣𝗮𝗶𝗿𝗲𝗱: ${name1} 💞 ${name2}
💘 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${compatibility}%`,
      mentions: [{ tag: name2, id: id2 }],
      attachment: fs.createReadStream(pathImg)
    },
    event.threadID,
    () => fs.unlinkSync(pathImg),
    event.messageID
  );
};
