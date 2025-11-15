module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "NM Nerob",
    description: "Send welcome messages with aesthetic blossom theme",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const path = join(__dirname, "cache", "joinvideo");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(__dirname, "cache", "joinvideo", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });

    return;
};

module.exports.run = async function ({ api, event }) {
    const { join } = global.nodemodule["path"];
    const fs = require("fs");
    const { threadID } = event;

    // When bot itself joins a group
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "NM Nerob's Bot" : global.config.BOTNAME}`, threadID, api.getCurrentUserID());

        return api.sendMessage("", event.threadID, () => api.sendMessage({
            body: `🌸 Hello everyone!

I'm NM Nerob's Bot 🤖

Type '${global.config.PREFIX}help' to see what I can do.

Happy to be here! 💮`,
            attachment: fs.existsSync(__dirname + "/cache/botj.mp4") ? fs.createReadStream(__dirname + "/cache/botj.mp4") : null
        }, threadID));
    }

    // When other members join
    else {
        try {
            const { createReadStream, existsSync, mkdirSync, readdirSync } = global.nodemodule["fs-extra"];
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const threadData = global.data.threadData.get(parseInt(threadID)) || {};
            const path = join(__dirname, "cache", "joinvideo");
            const pathGif = join(path, `${threadID}.video`);

            let mentions = [], nameArray = [], memLength = [], i = 0;

            for (let user of event.logMessageData.addedParticipants) {
                const userName = user.fullName;
                nameArray.push(userName);
                mentions.push({ tag: userName, id: user.userFbId });
                memLength.push(participantIDs.length - i++);
            }
            memLength.sort((a, b) => a - b);

            // Simple English blossom welcome message
            let msg = (typeof threadData.customJoin == "undefined") ? 
`🌸 Welcome {name}!

You are the {soThanhVien}ᵗʰ member of **{threadName}**.

We’re happy to have you here 💮

Type '${global.config.PREFIX}help' to see what I can do ✨

— NM Nerob's Bot` 
: threadData.customJoin;

            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, (memLength.length > 1) ? 'friends' : 'friend')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName)
                .replace(/\{prefix}/g, global.config.PREFIX || "/");

            if (!existsSync(path)) mkdirSync(path, { recursive: true });

            const gifFolder = join(__dirname, "cache", "joinvideo", "randomgif");
            let formPush;

            if (existsSync(pathGif)) {
                formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
            } else {
                const randomPath = existsSync(gifFolder) ? readdirSync(gifFolder) : [];
                if (randomPath.length != 0) {
                    const pathRandom = join(gifFolder, `${randomPath[Math.floor(Math.random() * randomPath.length)]}`);
                    formPush = { body: msg, attachment: createReadStream(pathRandom), mentions };
                } else {
                    formPush = { body: msg, mentions };
                }
            }

            return api.sendMessage(formPush, threadID);
        } catch (e) {
            console.log(e);
        }
    }
};
