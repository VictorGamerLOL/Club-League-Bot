const logger = require("../utilities/logger");

module.exports = {
  name: "ready",
  once: true,
  async execute() {
    logger.info("Bot is ready");
  },
};
