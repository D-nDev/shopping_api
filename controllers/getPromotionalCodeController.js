require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.query.id;
  
    if (!id) {
      const result = await db.query("SELECT * from promotional_codes");
      res.send(result.rows);
    } else {
      const result = await db.query(
        "SELECT * from promotional_codes WHERE id = $1",
        [id]
      );
      res.send(result.rows);
    }
  }
}