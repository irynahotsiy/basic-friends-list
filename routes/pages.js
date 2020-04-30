const express = require("express");
const { promisify } = require("util");

const connection = require("../dbconnection");

const query = promisify(connection.query).bind(connection);

const router = express.Router();

router.get("/users", async (req, res) => {
  const search = req.query.q;
  const current_user = req.session.user_id;

  // get filtered users by search word or just 20 first users
  const users = await query(
    `select users.full_name, relations.status, users.id from users 
        left join relations 
      on 
        users.id = relations.user_to and relations.user_from = ?
      where 
        ${search ? "full_name LIKE ? and " : ""} id != ? 
      order by 
        users.id
      limit 20`, // max 20 users in one search
    search
      ? [current_user, "%" + search + "%", current_user]
      : [current_user, current_user]
  );

  res.render("pages/users", { users, search });
});

router.get("/friends", async (req, res) => {
  const current_user = req.session.user_id;
  // get all users who sent request to current user
  const incomingRequests = await query(
    `select * from relations inner join users 
    on relations.user_from = users.id 
    where relations.user_to = ? and relations.status = 0`,
    [current_user]
  );

  // get all sent requests from current user
  const requested = await query(
    `select * from relations 
    inner join users on 
    relations.user_to = users.id 
    where relations.user_from = ? and relations.status = 0`,
    [current_user]
  );
  // get all friends of current user
  const friends = await query(
    `select * from relations 
    inner join users on relations.user_to = users.id 
    where relations.user_from = ? and relations.status = 1`,
    [current_user]
  );
  res.render("pages/friends", {
    incomingRequests,
    requested,
    friends,
  });
});

module.exports = router;
