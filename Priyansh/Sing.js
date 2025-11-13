const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Ensure cache folder exists
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "sing",
  version: "2.2.0",
  aliases: ["music", "song"],
  credits: "dipto",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  category: "media",
  commandCategory: "media",
  usePrefix: true,
  prefix: true,
  usages: "{pn} [<song name>|<song link>]\nExample:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event }) => {
  const { threadID, messageID, senderID } = event;

  if (!args[0]) return api.sendMessage("❌ Please provide a song name or link.", threadID, messageID);

  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  let videoID;

  // If user sent a YouTube link
  if (checkurl.test(args[0])) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;
    if (!videoID) return api.sendMessage("❌ Invalid YouTube link.", threadID, messageID);

    try {
      const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);
      const fileName = path.join(cacheDir, `audio_${senderID}_${Date.now()}.mp3`);

      await downloadFile(downloadLink, fileName);

      return api.sendMessage({
        body: `• Title: ${title}\n• Quality: ${quality}`,
        attachment: fs.createReadStream(fileName)
      }, threadID, () => fs.existsSync(fileName) && fs.unlinkSync(fileName), messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to download audio. Please try again later.", threadID, messageID);
    }
  }

  // If user sent a search keyword
  const keyWord = args.join(" ").replace("?feature=share", "");
  const maxResults = 6;
  let result;

  try {
    result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, maxResults);
  } catch (err) {
    return api.sendMessage("❌ Error while searching: " + err.message, threadID, messageID);
  }

  if (!result.length) return api.sendMessage(`⭕ No search results for: ${keyWord}`, threadID, messageID);

  // Prepare message with thumbnails
  let msg = "";
  const thumbnails = [];
  let i = 1;

  for (const info of result) {
    thumbnails.push(saveImage(info.thumbnail, `thumb_${senderID}_${i}.jpg`));
    msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
  }

  api.sendMessage({
    body: msg + "Reply to this message with a number to listen.",
    attachment: await Promise.all(thumbnails)
  }, threadID, (err, info) => {
    if (err) return console.error(err);
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: senderID,
      result
    });
  }, messageID);
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  if (senderID !== handleReply.author) return;

  const choice = parseInt(body);
  const { result } = handleReply;

  if (isNaN(choice) || choice <= 0 || choice > result.length)
    return api.sendMessage(`❌ Invalid choice. Enter a number between 1 and ${result.length}`, threadID, messageID);

  const infoChoice = result[choice - 1];
  const idvideo = infoChoice.id;

  try {
    const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`);
    const fileName = path.join(cacheDir, `audio_${senderID}_${Date.now()}.mp3`);

    await downloadFile(downloadLink, fileName);
    await api.unsendMessage(handleReply.messageID);

    await api.sendMessage({
      body: `• Title: ${title}\n• Quality: ${quality}`,
      attachment: fs.createReadStream(fileName)
    }, threadID, () => fs.existsSync(fileName) && fs.unlinkSync(fileName), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Failed to download audio. Maybe file size is too big (>26MB).", threadID, messageID);
  }
};

// Helper function to download file
async function downloadFile(url, filePath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filePath, Buffer.from(res.data));
  return fs.createReadStream(filePath);
}

// Helper function to save image locally
async function saveImage(url, fileName) {
  const filePath = path.join(__dirname, "cache", fileName);
  const res = await axios.get(url, { responseType: "stream" });
  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  return fs.createReadStream(filePath);
}
