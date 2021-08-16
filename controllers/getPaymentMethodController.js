require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.query.id;

    if (!id) {
      const result = await db.query("SELECT * from payment_method");
      res.send(result.rows);
    } else {
      const result = await db.query(
        "SELECT * from payment_method WHERE id = $1 and deleted_at IS NULL",
        [id]
      );
      res.send(result.rows);
    }
  },
};
