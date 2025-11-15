module.exports.config = {
  name: "imgur",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "N-E-R-O-B",
  description: "Upload an image to Imgur and get the link",
  commandCategory: "Other",
  usages: "Reply to an image with: imgur",
  cooldowns: 0,
};

module.exports.run = async ({ api, event }) => {
  const axios = global.nodemodule['axios'];

  try {
    const apis = await axios.get(
      "https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json"
    );
    const Shaon = apis.data.imgur;

    // Check for reply image
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0]
    ) {
      return api.sendMessage(
        "📌 Please reply to an image that you want to upload to Imgur.",
        event.threadID,
        event.messageID
      );
    }

    const linkanh = event.messageReply.attachments[0].url;

    const res = await axios.get(
      `${Shaon}/imgur?link=${encodeURIComponent(linkanh)}`
    );

    const img = res.data.uploaded.image;

    return api.sendMessage(
      `✔️ Your Imgur Link:\n${img}`,
      event.threadID,
      event.messageID
    );
  } catch (err) {
    return api.sendMessage(
      "❌ Failed to upload the image. Please try again.",
      event.threadID,
      event.messageID
    );
  }
};
