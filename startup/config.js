// essential config settings during application startup
const config = require("config");

module.exports = function () {
  if (!config.get("jwtPrivateKey")) throw new Error("FATAL: Jwt not set");
};
