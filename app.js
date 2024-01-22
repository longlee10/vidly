const express = require("express");
const app = express();
const winston = require("winston");

//  Winson error handling
require("./startup/logging")();

// check essential config settings during application startup
require("./startup/config")();

// Routes
require("./startup/routes")(app);

// connect to db
require("./startup/db")();

// validate input
require("./startup/validation")();

// set production environment
require("./startup/prod")(app);

// set view
app.set("view engine", "pug");

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}`)
);

module.exports = server;
