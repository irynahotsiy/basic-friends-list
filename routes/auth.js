const express = require("express");
const md5 = require("md5");
const { promisify } = require("util");

const connection = require("../dbconnection");

const query = promisify(connection.query).bind(connection);

const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/login");
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.pwd);
  const users = await query(
    `select * from users where  email = ? and passwordhash = ?`,
    [email, password]
  );

  if (users.length === 0) {
    // redirect back to login
    res.redirect("/");
    return;
  }

  req.session.user_id = users[0].id;
  res.redirect("/friends");
});

router.post("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

module.exports = router;
