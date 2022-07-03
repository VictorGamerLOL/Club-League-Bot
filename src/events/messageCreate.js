module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const azuma = new RegExp("azuma*", "i");
    const victor = new RegExp("victor*", "i");
    const room = new RegExp("room*", "i");
    if (azuma.test(message.content)) {
      message.channel.send("Sussy baka");
      message.react("980106629011877910");
    }
    if (victor.test(message.content)) {
      message.react("991083268671692810");
    }
    if (room.test(message.content)) {
      message.react("963839018846523422");
    }
  },
};
