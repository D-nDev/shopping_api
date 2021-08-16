require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const name = req.body.name;
    try {
      const result = await db.query(
        "INSERT INTO products_group(name) VALUES ($1) RETURNING *",
        [name]
      );
      if (result == 23505) {
        res.send("Group Name already exists");
      } else {
        res.send(result.rows[0]);
      }
    } catch (err) {
      res.send(err);
    }
  },
};
