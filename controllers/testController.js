require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const username = await db.query(
      "SELECT id from users where (id = $1 AND deleted_at IS NULL)",
      [1]
    );
    console.log(username.rows[0].id)
    res.status(200).send(`${username.rows[0].id}`);
  }
}