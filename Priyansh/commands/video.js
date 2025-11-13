const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json");
  return base.data.api;
};

module.exports = {
  config: {
    name: "video",
    version: "1.2.0",
    credits: "dipto",
    countDown: 5,
    hasPermssion: 0,
    description: "Download video/audio/info from YouTube/YTB",
    category: "media",
    commandCategory: "media",
    usePrefix: true,
    prefix: true,
    usages: `
 {pn} [video|-v|ytb] [<video name>|<video link>]
 {pn} [audio|-a|ytb-audio] [<video name>|<video link>]
 {pn} [info|-i|ytb-info] [<video name>|<video link>]
Example:
 {pn} -v chipi chipi
 {pn} -a chipi chipi
 {pn} -i chipi chipi`
  },

  run: async ({ api, args, event, global }) => {
    const { threadID, messageID, senderID } = event;

    global.client.handleReply = global.client.handleReply || [];

    let action = args[0] ? args[0].toLowerCase() : "-v";

    const videoActions = ["-v", "video", "mp4", "ytb"];
    const audioActions = ["-a", "audio", "mp3", "ytb-audio"];
    const infoActions = ["-i", "info", "ytb-info"];

    if (![...videoActions, ...audioActions, ...infoActions].includes(action)) {
      args.unshift("-v");
      action = "-v";
    }

    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const urlYtb = args[1] ? checkurl.test(args[1]) : false;

    // Direct YouTube link
    if (urlYtb) {
      const format = videoActions.includes(action) ? "mp4" : audioActions.includes(action) ? "mp3" : null;
      if (!format) return api.sendMessage("❌ Invalid format.", threadID, messageID);

      try {
        const videoID = args[1].match(checkurl)[1];
        const pathFile = path.join(cacheDir, `ytb_${format}_${videoID}.${format}`);
        const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);
        if (!data.downloadLink) return api.sendMessage("❌ Failed to get download link.", threadID, messageID);

        await downloadFile(data.downloadLink, pathFile);

        return api.sendMessage({
          body: `• Title: ${data.title}\n• Quality: ${data.quality}`,
          attachment: fs.createReadStream(pathFile)
        }, threadID, () => fs.existsSync(pathFile) && fs.unlinkSync(pathFile), messageID);

      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to download. Try again later.", threadID, messageID);
      }
    }

    // Search keyword
    args.shift();
    const keyWord = args.join(" ");
    if (!keyWord) return api.sendMessage("❌ Please provide a search keyword.", threadID, messageID);

    try {
      const searchResult = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, 6);
      if (!searchResult.length) return api.sendMessage(`⭕ No results for keyword: ${keyWord}`, threadID, messageID);

      let msg = "";
      const thumbnails = [];
      let i = 1;

      for (const info of searchResult) {
        thumbnails.push(streamImage(info.thumbnail, `thumbnail_${i}.jpg`));
        msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
      }

      api.sendMessage({
        body: msg + "👉 Reply with a number to select.",
        attachment: await Promise.all(thumbnails)
      }, threadID, (err, info) => {
        if (err) return console.error(err);
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: senderID,
          result: searchResult,
          action
        });
      }, messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Search error: " + err.message, threadID, messageID);
    }
  },

  handleReply: async ({ event, api, handleReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const { result, action } = handleReply;
    const choice = parseInt(body);
    if (isNaN(choice) || choice <= 0 || choice > result.length)
      return api.sendMessage("❌ Invalid number.", threadID, messageID);

    const videoID = result[choice - 1].id;
    const format = ["-v", "video", "mp4", "ytb"].includes(action) ? "mp4" : "mp3";
    const pathFile = path.join(cacheDir, `ytb_${format}_${videoID}.${format}`);

    try { await api.unsendMessage(handleReply.messageID); } catch (e) {}

    if (["-v", "video", "mp4", "ytb", "-a", "audio", "mp3", "ytb-audio"].includes(action)) {
      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=${format}&quality=3`);
        if (!data.downloadLink) return api.sendMessage("❌ Failed to get download link.", threadID, messageID);

        await downloadFile(data.downloadLink, pathFile);

        await api.sendMessage({
          body: `• Title: ${data.title}\n• Quality: ${data.quality}`,
          attachment: fs.createReadStream(pathFile)
        }, threadID, () => fs.existsSync(pathFile) && fs.unlinkSync(pathFile), messageID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to download video/audio.", threadID, messageID);
      }
    }

    if (["-i", "info", "ytb-info"].includes(action)) {
      try {
        const { data } = await axios.get(`${await baseApiUrl()}/ytfullinfo?videoID=${videoID}`);
        const thumbPath = path.join(cacheDir, "info_thumb.jpg");
        await streamImage(data.thumbnail, "info_thumb.jpg");

        await api.sendMessage({
          body: `✨ Title: ${data.title}\n⏳ Duration: ${(data.duration/60).toFixed(2)} mins\n📺 Resolution: ${data.resolution}\n👀 Views: ${data.view_count}\n👍 Likes: ${data.like_count}\n💬 Comments: ${data.comment_count}\n📂 Category: ${data.categories[0]}\n📢 Channel: ${data.channel}\n🔗 Video URL: ${data.webpage_url}`,
          attachment: fs.createReadStream(thumbPath)
        }, threadID, () => fs.existsSync(thumbPath) && fs.unlinkSync(thumbPath), messageID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Failed to retrieve video info.", threadID, messageID);
      }
    }
  }
};

// Helpers
async function downloadFile(url, pathName) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(pathName, Buffer.from(res.data));
  return fs.createReadStream(pathName);
}

async function streamImage(url, fileName) {
  const filePath = path.join(__dirname, "cache", fileName);
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(fs.createReadStream(filePath)));
    writer.on("error", reject);
  });
}
