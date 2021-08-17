require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const name = req.body.name;
    const portion = req.body.portion;
    try {
      const result = await db.query(
        "INSERT INTO payment_method(name, portion_quantity) VALUES ($1, $2) RETURNING *",
        [name, portion]
      );
      if (result == 23505) {
        res.status(400).send("Method already exists");
      } else {
        res.status(201).send(result.rows[0]);
      }
    } catch (err) {
      res.send(err);
    }
  },
};
