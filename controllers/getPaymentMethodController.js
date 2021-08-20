require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.query.id;

    if (!id) {
      const result = await db.query("SELECT * from payment_method");
      res.status(200).send(result.rows);
    } else {
      const result = await db.query(
        "SELECT * from payment_method WHERE id = $1 and deleted_at IS NULL",
        [id]
      );
      if (result.rows.length <= 0) {
        res.status(404).send("Payment method not found");
      } else {
        res.status(200).send(result.rows);
      }
    }
  },
};
