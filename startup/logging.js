// require("express-async-errors");
const winston = require("winston");
// require("winston-mongodb");

module.exports = function () {
  new winston.ExceptionHandler(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
  });

  // logging errors
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  // winston.add(
  //   new winston.transports.MongoDB({
  //     db: "mongodb://127.0.0.1:27017/vidly",
  //     options: {
  //       useUnifiedTopology: true,
  //     },
  //   })
  // );
};
