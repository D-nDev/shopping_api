require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const group_id = req.body.group_id;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    try {
      const result = await db.query(
        "INSERT INTO products(group_id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [group_id, name, price, description]
      );
      if (result == 23503) {
        res.send("Invalid Product Group ID");
      } else {
        res.send(result.rows[0]);
      }
    } catch (err) {
      res.send(err);
    }
  },
};
