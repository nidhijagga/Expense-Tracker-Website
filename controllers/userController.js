const path = require("path");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.getLoginPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
};

exports.postUserSignUp = (req, res, next) => {
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

exports.postUserLogin = (req, res, next) => {
  const email = req.body.loginEmail;
  const password = req.body.loginPassword;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res
            .status(500)
            .send(
              `<script>alert('Something went wrong!'); window.location.href='/'</script>`
            );
        }
        if (result === true) {
          res
            .status(200)
            .send(
              `<script>alert('Login Successful!'); window.location.href='/'</script>`
            );
        } else {
          res
            .status(401)
            .send(
              `<script>alert('Password Incorrect!'); window.location.href='/'</script>`
            );
        }
      });
    } else {
      res
        .status(404)
        .send(
          `<script>alert("User doesn't Exists!"); window.location.href='/'</script>`
        );
    }
  });
};
