const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "expense_tracker_website",
  "root",
  "ANni2616@sql%",
  {
    dialect: "mysql",
    host: "localhost",
  }
);

module.exports = sequelize;
