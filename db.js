var config = require("./config");
var pg = require("pg");
var env = process.env.NODE_ENV || "development";
var client = new pg.Client(config.database);
if (env !== "development" && env !== "test") {
  client.ssl = true;
}

client.connect(function (err) {
  console.log("db connect finished");
  if (err) {
    console.log("Error connecting to database: " + err);
    throw err;
  }
});

module.exports = client;
