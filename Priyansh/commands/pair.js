module.exports.config = {
  name: "pair",
  version: "2.1.0", // Updated version for new background and coordinates
  hasPermssion: 0,
  credits: "Nerob Upgrade + Gemini Enhancement",
  description: "Compatibility pairing for entertainment. Tries to pair with the opposite gender.",
  commandCategory: "love",
  usages: "[No arguments]",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 5
}

module.exports.run = async function ({ args, Users, Threads, api, event }) {

  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];

  // File paths for caching images
  let pathImg = __dirname + "/cache/canvas/Pair.jpg";
  let pathAvt1 = __dirname + "/cache/avt1.png";
  let pathAvt2 = __dirname + "/cache/avt2.png";

  var id1 = event.senderID;
  var name1 = await Users.getNameUser(id1);

  try {
    var threadInfo = await api.getThreadInfo(event.threadID);
  } catch (e) {
    return api.sendMessage("❌ Could not retrieve thread information.", event.threadID, event.messageID);
  }

  var all = threadInfo.userInfo;

  let gender1;
  for (let u of all) if (u.id == id1) gender1 = u.gender;

  const botID = api.getCurrentUserID();
  let selected = [];

  // --- Pairing Logic: Selects opposite gender members ---
  if (gender1 === "FEMALE") {
    selected = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID && !u.isFriend).map(u => u.id);
  } else if (gender1 === "MALE") {
    selected = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID && !u.isFriend).map(u => u.id);
  } else {
    // Fallback if gender is unknown or user is not a friend
    selected = all.filter(u => u.id !== id1 && u.id !== botID && !u.isFriend).map(u => u.id);
  }

  // --- CHECK FOR AVAILABLE PARTNERS ---
  if (selected.length === 0) {
      return api.sendMessage("😔 The thread doesn't have any suitable partners (opposite gender or non-bot/non-self) to pair with.", event.threadID, event.messageID);
  }
  
  // Select the random partner
  var id2 = selected[Math.floor(Math.random() * selected.length)];
  var name2 = await Users.getNameUser(id2);

  // SPECIAL FIXED PAIR LOGIC (For custom hardcoded IDs)
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

  // IMAGES (Fetching and processing)
  // *** NEW BACKGROUND IMAGE LINK ***
  let bgLinks = [
    "https://i.imgur.com/P8ATVjE.jpeg", // Eren and Mikasa image
    "https://i.imgur.com/P8ATVjE.jpeg" // Original background (kept as backup)
  ];

  // Always select the new background for this specific request
  let selectedBG = bgLinks[0]; 

  try {
    // 1. Fetch and save Avatars
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

    // 2. Fetch and save Background
    let bg = (
      await axios.get(selectedBG, { responseType: "arraybuffer" })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

    // 3. Load Images onto Canvas
    let baseBG = await loadImage(pathImg);
    let baseA1 = await loadImage(pathAvt1);
    let baseA2 = await loadImage(pathAvt2);

    // Create canvas based on the background size
    let canvas = createCanvas(baseBG.width, baseBG.height); 
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseBG, 0, 0, canvas.width, canvas.height);
    
    // *** COORDINATE ADJUSTMENT (Based on the source image) ***
    // The source image is roughly 750x500 pixels.
    // We will place 150x150 avatars over the faces.

    const avatarSize = 150; // Size of the user's avatar circle/square

    // Boy (Left) Avatar: Placed over Eren's face
    // X: ~100, Y: ~100
    ctx.drawImage(baseA1, 100, 100, avatarSize, avatarSize);

    // Female (Right) Avatar: Placed over Mikasa's face
    // X: ~450, Y: ~100
    ctx.drawImage(baseA2, 450, 100, avatarSize, avatarSize);
    
    // --- DRAWING A RECTANGLE (PP Retrangle) ---
    // If you want a bounding box around the boy (left) and the female (right):
    // Drawing a simple red border for demonstration. You can remove this.
    /*
    ctx.strokeStyle = '#FF0000'; // Red color
    ctx.lineWidth = 4;

    // Rectangle around Boy (Left) Avatar
    ctx.strokeRect(100, 100, avatarSize, avatarSize);

    // Rectangle around Female (Right) Avatar
    ctx.strokeRect(450, 100, avatarSize, avatarSize);
    */
    // If you want the background to be scaled to a specific size like 1200x600, 
    // you would need more advanced coordinate mapping. 
    // For simplicity, we are using the original image size and placing avatars over the faces.


    // 4. Save Final Image
    fs.writeFileSync(pathImg, canvas.toBuffer());
    
  } catch (e) {
      // General error handling for image creation/fetching
      console.error("Error generating image in pair command:", e);
      // Clean up intermediate files
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
      return api.sendMessage(`An error occurred during image processing: ${e.message}`, event.threadID, event.messageID);
  } finally {
      // Ensure Avatars are removed after processing
      if (fs.existsSync(pathAvt1)) fs.removeSync(pathAvt1);
      if (fs.existsSync(pathAvt2)) fs.removeSync(pathAvt2);
  }

  // Final message sending
  return api.sendMessage(
    {
      body:
`${caption}

✨ 𝗣𝗮𝗶𝗿𝗲𝗱: ${name1} 💞 ${name2}
💘 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${compatibility}${isInfinity ? '' : '%'}`, // Removes '%' if compatibility is infinity
      mentions: [{ tag: name2, id: id2 }],
      attachment: fs.createReadStream(pathImg)
    },
    event.threadID,
    () => fs.unlinkSync(pathImg), // Clean up final image after sending
    event.messageID
  );
};
