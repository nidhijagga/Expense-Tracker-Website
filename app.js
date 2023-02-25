const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const sequelize = require("./util/database");

const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");

const User = require("./models/userModel");
const Expense = require("./models/expenseModel");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);

app.use("/homePage", expenseRouter);
app.use("/expense", expenseRouter);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
