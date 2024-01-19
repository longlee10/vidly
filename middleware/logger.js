function logger(req, res, next) {
  console.log("Logging in...");
  next();
}

module.exports = logger;
