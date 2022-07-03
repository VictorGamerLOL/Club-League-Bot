const chalk = require("chalk");
const fs = require("fs");
//dont worry about this its basically just a logger
function info(args, args2) {
  if (args2 == null) {
    console.log(
      chalk.magentaBright(
        new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")
      ) +
        chalk.cyan(" :: INFO :: ") +
        chalk.green(`${args}`)
    );
    let line =
      new Date().toISOString().replace(/T/, " ").replace(/Z/, "") +
      " :: INFO :: " +
      `${args}\n`;
    fs.appendFile("./logs/info.log", line, function (err) {
      if (err) {
        fs.mkdirSync("./logs");
        info(args);
      }
    });
  } else {
    console.log(
      chalk.magentaBright(
        new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")
      ) +
        chalk.cyan(" :: INFO :: ") +
        chalk.green(`${args}`),
      chalk.blueBright(`${args2}`)
    );
    let line =
      new Date().toISOString().replace(/T/, " ").replace(/Z/, "") +
      " :: INFO :: " +
      `${args} ${args2}\n`;
    fs.appendFile("./logs/info.log", line, function (err) {
      if (err) {
        fs.mkdirSync("./logs");
        info(args, args2);
      }
    });
  }
}

function error(args) {
  console.log(
    chalk.magentaBright(
      new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")
    ),
    chalk.red(" :: ERROR :: "),
    chalk.yellow(`${args}`)
  );
  let line =
    new Date().toISOString().replace(/T/, " ").replace(/Z/, "") +
    " :: ERROR :: " +
    `${args}\n`;
  fs.appendFile("./logs/error.log", line, function (err) {
    if (err) {
      fs.mkdirSync("./logs");
      error(args);
    }
  });
}

function sql(args) {
  let line =
    new Date().toISOString().replace(/T/, " ").replace(/Z/, "") +
    " :: SQL :: " +
    `${args}\n`;
  fs.appendFile("./logs/sql.log", line, function (err) {
    if (err) {
      fs.mkdirSync("./logs");
      sql(args);
    }
  });
}

module.exports = {
  info: info,
  error: error,
  sql: sql,
};
