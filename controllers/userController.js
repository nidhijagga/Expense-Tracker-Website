const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../util/database");
const Sib = require("sib-api-v3-sdk");

function generateAccessToken(id, email) {
  return jwt.sign(
    { userId: id, email: email },
    "kjhsgdfiuiew889kbasgdfskjabsdfjlabsbdljhsd"
  );
}

const isPremiumUser = async (req, res, next) => {
  try {
    if (req.user.isPremiumUser) {
      return res.json({ isPremiumUser: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const getLoginPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
  } catch (error) {
    console.log(error);
  }
};

const postUserSignUp = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    await User.findOne({ where: { email: email } })
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
  } catch (error) {
    console.log(error);
  }
};

const postUserLogin = async (req, res, next) => {
  try {
    const email = req.body.loginEmail;
    const password = req.body.loginPassword;

    await User.findOne({ where: { email: email } }).then((user) => {
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
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

const resetPasswordPage = async (req, res, next) => {
  try {
    res
      .status(200)
      .sendFile(
        path.join(__dirname, "../", "public", "views", "resetPassword.html")
      );
  } catch (error) {
    console.log(error);
  }
};

const sendMail = async (req, res, next) => {
  try {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.RESET_PASSWORD_API_KEY;
    const transEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email: "nidhijagga5239@gmail.com",
      name: "Nidhi",
    };
    const receivers = [
      {
        email: req.body.email,
      },
    ];
    const emailResponse = await transEmailApi.sendTransacEmail({
      sender,
      To: receivers,
      subject: "Expense Tracker Reset Password",
      textContent: "Link Below",
      // htmlContent: `<h3>link for reset the password</h3>`,
    });
    res.send(
      `<script>alert('Check your mails, Link for reset the password is successfully send on your Mail Id!'); window.location.href='/'</script>`
    );
    res.redirect("/");
  } catch (error) {
    console.log("error");
  }
};

module.exports = {
  generateAccessToken,
  getLoginPage,
  postUserLogin,
  postUserSignUp,
  isPremiumUser,
  getAllUsers,
  resetPasswordPage,
  sendMail,
};
