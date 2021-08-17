require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const name = req.body.name;
    const portion = req.body.portion;
    const daystopay = req.body.daystopay;
    if (!name) {
      res.status(400).send("Please fill the name");
    } else if (!portion) {
      res.status(400).send("Please fill the portion");
    } else if (!daystopay) {
      res.status(400).send("Please fill days to pay");
    } else {
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
        res.status(500).send(err);
      }
    }
  },
};
