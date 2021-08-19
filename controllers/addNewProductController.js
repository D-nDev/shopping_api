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
      if (result.code == 23503) {
        res.status(404).send("Invalid Product Group ID");
      } else {
        res.status(201).send(result.rows[0]);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
