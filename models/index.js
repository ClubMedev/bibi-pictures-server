"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + '/../config/config.json')[env];
const config = require("../config/config.js")[env]; // using js file rather than json to access .env secret values.
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // sequelize = new Sequelize({
  //   database: config.database,
  //   user: config.username,
  //   password: config.password,
  //   host: config.host,
  //   dialect: 'postgres',
  //   protocol: 'postgres',
  //   ssl: {
  //     require: true,
  //   },
  // });
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    protocol: "postgres",
    ssl: {
      require: true,
    },
  });
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
