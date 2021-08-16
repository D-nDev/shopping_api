require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.query.id;

    if (!id) {
      const result = await db.query("SELECT * from providers");
      res.send(result.rows);
    } else {
      const result = await db.query("SELECT * from providers WHERE id = $1", [
        id,
      ]);
      res.send(result.rows);
    }
  },
};
