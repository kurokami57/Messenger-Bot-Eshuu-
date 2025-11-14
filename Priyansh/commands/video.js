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
    version: "2.0.0",
    credits: "Dipto (Fixed by GPT)",
    hasPermssion: 0,
    usePrefix: true,
    prefix: true,
    category: "media",
    commandCategory: "media",
    description: "Download YouTube video/audio/info",
    countDown: 5,
    usages: `
{pn} -v <name/link>
{pn} -a <name/link>
{pn} -i <name/link>
`
  },

  run: async ({ api, args, event, global }) => {
    const { threadID, messageID, senderID } = event;

    global.client.handleReply ??= [];

    let action = args[0] ? args[0].toLowerCase() : "-v";

    const videoActions = ["-v", "video", "mp4", "ytb"];
    const audioActions = ["-a", "audio", "mp3", "ytb-audio"];
    const infoActions = ["-i", "info", "ytb-info"];

    if (![...videoActions, ...audioActions, ...infoActions].includes(action)) {
      args.unshift("-v");
      action = "-v";
    }

    // FIXED REGEX (supports all YouTube formats)
    const checkurl =
      /(?:youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/)|youtu\.be\/)([\w-]{11})/;

    const isLink = args[1] && checkurl.test(args[1]);

    // ---- DIRECT LINK MODE ----
    if (isLink) {
      const id = args[1].match(checkurl)[1];
      const format = videoActions.includes(action) ? "mp4" : audioActions.includes(action) ? "mp3" : null;
      if (!format) return api.sendMessage("❌ Invalid format.", threadID, messageID);

      const pathFile = path.join(cacheDir, `ytb_${id}.${format}`);

      try {
        const apiBase = await baseApiUrl();
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${id}&format=${format}&quality=3`);

        if (!data.downloadLink)
          return api.sendMessage("❌ API did not return download link.", threadID, messageID);

        await downloadFile(data.downloadLink, pathFile);

        return api.sendMessage({
          body: `🎬 Title: ${data.title}\n📌 Quality: ${data.quality}`,
          attachment: fs.createReadStream(pathFile)
        }, threadID, () => fs.unlinkSync(pathFile), messageID);

      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ Download failed.", threadID, messageID);
      }
    }

    // ---- SEARCH MODE ----
    args.shift();
    const keyword = args.join(" ");
    if (!keyword) return api.sendMessage("❗ Give a keyword.", threadID, messageID);

    try {
      const apiBase = await baseApiUrl();
      let res = await axios.get(`${apiBase}/ytFullSearch?songName=${encodeURIComponent(keyword)}`);
      let result = Array.isArray(res.data) ? res.data : res.data.result || [];

      if (!result.length)
        return api.sendMessage("⭕ No results.", threadID, messageID);

      result = result.slice(0, 6);

      let msg = "";
      let thumbnails = [];
      let i = 1;

      for (const info of result) {
        msg += `${i}. ${info.title}\n⏳ ${info.time}\n📺 ${info.channel.name}\n\n`;
        thumbnails.push(streamImage(info.thumbnail, `thumb_${i}.jpg`));
        i++;
      }

      api.sendMessage({
        body: msg + "➡ Reply a number.",
        attachment: await Promise.all(thumbnails)
      }, threadID, (err, info) => {
        if (err) return;

        global.client.handleReply.push({
          name: "video",
          messageID: info.messageID,
          author: senderID,
          result,
          action
        });
      }, messageID);

    } catch (err) {
      console.log(err);
      api.sendMessage("❌ Search error.", threadID, messageID);
    }
  },

  // ---- REPLY HANDLER ----
  handleReply: async ({ event, api, handleReply, global }) => {
    const { threadID, messageID, senderID, body } = event;

    if (senderID !== handleReply.author) return;

    const { result, action } = handleReply;
    const choice = Number(body);

    if (!choice || choice < 1 || choice > result.length)
      return api.sendMessage("❌ Invalid number.", threadID, messageID);

    const id = result[choice - 1].id;
    const format = ["-v", "video", "mp4"].includes(action) ? "mp4" : "mp3";
    const pathFile = path.join(cacheDir, `${id}.${format}`);

    try { await api.unsendMessage(handleReply.messageID); } catch {}

    // Remove old handleReply
    const index = global.client.handleReply.indexOf(handleReply);
    if (index !== -1) global.client.handleReply.splice(index, 1);

    const apiBase = await baseApiUrl();

    // ---- VIDEO / AUDIO MODE ----
    if (["mp4", "mp3"].includes(format)) {
      try {
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${id}&format=${format}&quality=3`);

        if (!data.downloadLink)
          return api.sendMessage("❌ Failed to get link.", threadID, messageID);

        await downloadFile(data.downloadLink, pathFile);

        await api.sendMessage({
          body: `🎬 Title: ${data.title}\n📌 Quality: ${data.quality}`,
          attachment: fs.createReadStream(pathFile)
        }, threadID, () => fs.unlinkSync(pathFile), messageID);

      } catch (err) {
        console.log(err);
        api.sendMessage("❌ Download error.", threadID, messageID);
      }
    }

    // ---- INFO MODE ----
    if (["-i", "info", "ytb-info"].includes(action)) {
      try {
        const { data } = await axios.get(`${apiBase}/ytfullinfo?videoID=${id}`);
        const thumb = path.join(cacheDir, "info.jpg");

        await streamImage(data.thumbnail, "info.jpg");

        api.sendMessage({
          body: `🎬 ${data.title}\n⏳ ${(data.duration / 60).toFixed(2)} mins\n📊 ${data.resolution}\n👁 ${data.view_count}\n👍 ${data.like_count}\n💬 ${data.comment_count}\n📢 ${data.channel}\n🔗 ${data.webpage_url}`,
          attachment: fs.createReadStream(thumb)
        }, threadID, () => fs.unlinkSync(thumb), messageID);

      } catch (err) {
        console.log(err);
        api.sendMessage("❌ Info error.", threadID, messageID);
      }
    }
  }
};

// ---- HELPERS ----
async function downloadFile(url, out) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(out, Buffer.from(res.data));
}

async function streamImage(url, name) {
  const filePath = path.join(__dirname, "cache", name);
  const res = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);
  return new Promise((resolve) => writer.on("finish", () => resolve(fs.createReadStream(filePath))));
}
