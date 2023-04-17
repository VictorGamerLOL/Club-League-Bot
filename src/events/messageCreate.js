const Discord = require("discord.js");

module.exports = {
  name: "messageCreate",
  once: false,
  /**
   *
   * @param {Discord.Message} message
   */
  async execute(message) {
    const azuma = new RegExp("azuma*", "i");
    const victor = new RegExp("victor*", "i");
    const room = new RegExp("room*", "i");
    if (azuma.test(message.content)) {
      message.react("980106629011877910");
    } else if (victor.test(message.content)) {
      message.react("991083268671692810");
    } else if (room.test(message.content)) {
      message.react("963839018846523422");
    }
  },
};
