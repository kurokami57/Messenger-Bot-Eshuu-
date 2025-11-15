module.exports.config = {
    name: "autoBotNick",
    eventType: ["log:subscribe"],
    version: "1.0.0",
    credits: "NM Nerob",
    description: "Automatically sets bot nickname when added to a group"
};

module.exports.run = async function({ api, event }) {
    const { threadID, logMessageData } = event;

    // Check if the bot is the one being added
    const botID = api.getCurrentUserID();
    const addedIDs = logMessageData.addedParticipants.map(p => p.userFbId);

    if (addedIDs.includes(botID)) {
        const newNick = `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "Bot"}`;
        try {
            await api.changeNickname(newNick, threadID, botID);
            console.log(`✅ Bot nickname set to "${newNick}" in thread ${threadID}`);
        } catch (err) {
            console.error("❌ Failed to set bot nickname:", err);
        }
    }
};
