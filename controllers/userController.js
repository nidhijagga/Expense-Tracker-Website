const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");

function generateAccessToken(id, email) {
  return jwt.sign(
    { userId: id, email: email },
    "kjhsgdfiuiew889kbasgdfskjabsdfjlabsbdljhsd"
  );
}

const isPremiumUser = (req, res, next) => {
  if (req.user.isPremiumUser) {
    return res.json({ isPremiumUser: true });
  }
};

const getLoginPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
};

const postUserSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        res
          .status(409)
          .send(
            `<script>alert('This email is already taken. Please choose another one.'); window.location.href='/'</script>`
          );
      } else {
        bcrypt.hash(password, 10, async (err, hash) => {
          await User.create({
            name: name,
            email: email,
            password: hash,
          });
        });
        res
          .status(200)
          .send(
            `<script>alert('User Created Successfully!'); window.location.href='/'</script>`
          );
      }
    })
    .catch((err) => console.log(err));
};

const postUserLogin = (req, res, next) => {
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Something went Wrong!" });
        }
        if (result == true) {
          return res.status(200).json({
            success: true,
            message: "Login Successful!",
            token: generateAccessToken(user.id, user.email),
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Password Incorrect!",
          });
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User doesn't Exists!",
      });
    }
  });
};

const getAllUsers = (req, res, next) => {
  User.findAll({
    attributes: [
      [sequelize.col("name"), "name"],
      [sequelize.col("totalExpenses"), "totalExpenses"],
    ],
    order: [[sequelize.col("totalExpenses"), "DESC"]],
  }).then((users) => {
    const result = users.map((user) => ({
      name: user.getDataValue("name"),
      totalExpenses: user.getDataValue("totalExpenses"),
    }));
    res.send(JSON.stringify(result));
  });
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserLogin,
  postUserSignUp,
  isPremiumUser,
  getAllUsers,
};
