const path = require("path");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const database = require("../util/database");

exports.getHomePage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "homePage.html"));
};

exports.addExpense = (req, res, next) => {
  const date = req.body.date;
  const category = req.body.category;
  const description = req.body.description;
  const amount = req.body.amount;

  User.update(
    {
      totalExpenses: req.user.totalExpenses + amount,
    },
    { where: { id: req.user.id } }
  );

  Expense.create({
    date: date,
    category: category,
    description: description,
    amount: amount,
    userId: req.user.id,
  })
    .then((result) => {
      res.status(200);
      res.redirect("/homePage");
    })
    .catch((err) => console.log(err));
};

exports.getAllExpenses = (req, res, next) => {
  Expense.findAll({ where: { userId: req.user.id } })
    .then((expenses) => {
      res.json(expenses);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteExpense = (req, res, next) => {
  const id = req.params.id;
  Expense.findByPk(id).then((expense) => {
    User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount,
      },
      { where: { id: req.user.id } }
    );
  });
  Expense.destroy({ where: { id: id, userId: req.user.id } })
    .then((result) => {
      res.redirect("/homePage");
    })
    .catch((err) => console.log(err));
};

exports.editExpense = (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
  const category = req.body.category;
  const description = req.body.description;
  const amount = req.body.amount;
  Expense.findByPk(id).then((expense) => {
    User.update(
      {
        totalExpenses: req.user.totalExpenses - expense.amount + amount,
      },
      { where: { id: req.user.id } }
    );
  });
  Expense.update(
    {
      category: category,
      description: description,
      amount: amount,
    },
    { where: { id: id, userId: req.user.id } }
  )
    .then((result) => {
      res.redirect("/homePage");
    })
    .catch((err) => console.log(err));
};
