Const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "Obot",
  version: "1.0.2", // Updated version
  hasPermssion: 0,
  credits: "Nerob + Gemini", // Added credit for modifications
  description: "friendly bot",
  commandCategory: "Noprefix",
  usages: "noprefix",
  cooldowns: 5,
};

module.exports.handleEvent = async function({ api, event, Threads, Users }) {
  var { threadID } = event;
  // NOTE: Removed moment and time/name variables as they were unused in the final reply logic

  // --- Wholesome Replies List ---
  var tl = [
    "হাই! 😊 কেমন আছেন?",
    "আপনি ডাকলে ভালোই লাগে 🥰",
    "জী বলুন, আপনাকে কিভাবে সাহায্য করতে পারি? 💛",
    "আমি আছি শুনতে। বলুন 🙂",
    "সবসময় ভালো থাকবেন, প্রার্থনা রইলো 💛",
    "আপনার কথা শুনতে ভালো লাগে 😌",
    "হুম, বলুন 😊",
    "আপনি হাসলে আমিও হাসি 😊",
    "বন্ধুত্ব হচ্ছে হৃদয়ের ভাষা 🤍",
    "আজকে দিনটা কেমন গেল? 🌼",
    "কেমন আছেন? মন খারাপ করে রাখবেন না 🙂",
    "সব ঠিক হয়ে যাবে 🌿",
    "আপনি খুব ভালো একজন মানুষ 😊",
    "ধন্যবাদ! আপনার এই কথাটা খুব ভালো লাগলো 💛",
    "সবসময় পজিটিভ থাকুন 🌻",
    "বুঝতে পারছি, আপনি চাইলে আরও বলতে পারেন 🙂",
    "আল্লাহ আপনাকে সুস্থ ও ভালো রাখুক 💚",
    "আপনার হাসিটা খুব সুন্দর 😊",
    "যেকোনো সাহায্য লাগলে বলবেন 🌼",
    "আপনার দিনটা শুভ হোক 🌸",
    "আমি চেষ্টা করি সবাইকে ভালো রাখার জন্য 🫶",
    "ভালো আচরণ সবসময় সুন্দর 🌿",
    "ধৈর্য ধরুন, সব ঠিক হবে 💛",
    "আপনি একা নন, আমি আছি 🙂",
    "ধন্যবাদ! আপনার কথায় অনেক ভালো লাগলো 🤍"
  ];

  var rand = tl[Math.floor(Math.random() * tl.length)];
  var body = event.body ? event.body.toLowerCase() : "";

  // Check if the message is empty or null
  if (!body) return;

  // --- Keyword Replies (Using .includes() for flexibility) ---

  // miss you
  if (body.includes("miss you") || body.includes("মিস করি")) {
    return api.sendMessage("আমিও আপনাকে মিস করি 😊", threadID);
  }

  // kiss emoji
  if (body.includes("😘") || body.includes("kiss")) {
    return api.sendMessage("হাসি দিলেই যথেষ্ট, কিস দরকার নেই 😅", threadID);
  }

  // help
  if (body.includes("help") || body.includes("সাহায্য")) {
    return api.sendMessage("Type /help 😊", threadID);
  }

  // good morning
  if (body.includes("good morning") || body.includes("morning") || body.includes("শুভ সকাল")) {
    return api.sendMessage("শুভ সকাল! সুন্দর দিন কাটুক 🌼", threadID);
  }

  // Assalamualaikum
  if (body.includes("assalamualaikum") || body.includes("আসসালামু আলাইকুম")) {
    return api.sendMessage("ওয়ালাইকুমুস সালাম 🤍", threadID);
  }

  // owner/admin
  if (body.includes("owner") || body.includes("ceo") || body.includes("admin") || body.includes("boter admin")) {
    return api.sendMessage("আমার Admin/Owner: Nerob ❤️", threadID);
  }

  // nerob
  if (body.includes("nerob")) {
    return api.sendMessage("Nerob ভাই এখন কাজে ব্যস্ত, আপনি চাইলে আমাকে বলতে পারেন 😊", threadID);
  }
  
  // Bot name (Obot) - Triggers a default friendly reply
  if (body.includes("obot") || body.includes("o bot") || body.includes("ওবট") || body.includes("ও বট")) {
      return api.sendMessage(rand, threadID);
  }

  // --- Default Reply (Fallback) ---
  // If the message is short OR if the message contains one of the bot's name/mentions
  // NOTE: The previous length check (< 8) is removed. The default reply now triggers randomly on any short message
  // that didn't match a specific keyword, making it a better conversational fallback.
  if (body.length < 15 && Math.random() < 0.3) { // Trigger on short messages (< 15 chars) with a 30% chance
    return api.sendMessage(rand, threadID);
  }
};
