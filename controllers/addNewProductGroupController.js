require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
    const name = req.body.name;
    try {
      const result = await db.query(
        "INSERT INTO products_group(name, creation_userid) VALUES ($1, $2) RETURNING *",
        [name, userid]
      );
      if (result.code == 23505) {
        res.status(400).send("Group Name already exists");
      } else {
        res.status(201).send(result.rows[0]);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
