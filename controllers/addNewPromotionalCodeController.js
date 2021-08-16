require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const code = req.body.code;
    const discount = req.body.discount;
    const type_discount = req.body.type_discount;
    try {
      const result = await db.query(
        "INSERT INTO promotional_codes(code, discount, type_discount) VALUES ($1, $2, $3) RETURNING *",
        [code, discount, type_discount]
      );
      if (result == 23505) {
        res.send("Code already exists");
      } else if (result == 23514) {
        res.send("Invalid discount type");
      } else {
        res.send(result.rows[0]);
      }
    } catch (err) {
      res.send(err);
    }
  },
};
