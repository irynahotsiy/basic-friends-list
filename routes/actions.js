const express = require("express");
const { promisify } = require("util");

const connection = require("../dbconnection");

const query = promisify(connection.query).bind(connection);

const router = express.Router();
router.post("/delete", async (req, res) => {
  const current_user = req.session.user_id;
  const user_to_delete = req.body.id;

  // delete direct and reverse connections from database
  const user = await query(
    `
      delete from relations 
      where 
        (user_from = ? and user_to = ?) 
      or 
        (user_to = ? and user_from = ?) 
      and 
        status = 1
    `,
    [current_user, user_to_delete, current_user, user_to_delete]
  );
  res.redirect("back");
});

router.post("/add", async (req, res) => {
  const current_user = req.session.user_id;
  const user_to_add = req.body.id;

  const rejectedRelation = await query(
    `
    select * from relations 
    where user_from = ?  and  user_to = ? and status = 2
  `,
    [current_user, user_to_add]
  );
  // redirect back if connection already rejected
  if (rejectedRelation.length >= 1) {
    res.redirect("back");
    return;
  }

  const reverseRequest = await query(
    `select * from relations 
        where user_from = ? and user_to = ? and status = 0 
      `,
    [user_to_add, current_user]
  );

  // add new relation if not reverse connection yet
  if (reverseRequest.length === 0) {
    await query(
      `insert into relations (user_from, user_to, status ) values (?, ?, 0)`,
      [current_user, user_to_add]
    );
    res.redirect("back");
    return;
  }

  // set status to friends and add direct connection if reverse connection exists
  await query(
    `update relations set status = 1 where user_from = ? and user_to = ? and status = 0`,
    [user_to_add, current_user]
  );
  await query(
    `insert into relations (user_from, user_to, status ) values (?, ?, 1)`,
    [current_user, user_to_add]
  );
  res.redirect("back");
});

router.post("/accept", async (req, res) => {
  const current_user = req.session.user_id;
  const user_to_add = req.body.id;
  // add direct and reverse connections to database
  await query(
    `insert into relations (user_from, user_to, status ) values (?, ?, 1)`,
    [current_user, user_to_add]
  );
  await query(
    `update relations set status = 1 where user_from = ? and user_to = ?`,
    [user_to_add, current_user]
  );
  res.redirect("back");
});

router.post("/ignore", async (req, res) => {
  const current_user = req.session.user_id;
  const user_to_ignore = req.body.id;
  // set status to rejected
  await query(
    `update relations set status = 2 where user_from = ? and user_to = ?`,
    [user_to_ignore, current_user]
  );
  res.redirect("back");
});

router.post("/cancel", async (req, res) => {
  const current_user = req.session.user_id;
  const user_to_cancel = req.body.id;
  // delete request
  await query(
    `delete from relations 
    where 
      (user_from = ? and user_to = ?) and (status = 0 or status = 2)`,
    [current_user, user_to_cancel]
  );
  res.redirect("back");
});

module.exports = router;
