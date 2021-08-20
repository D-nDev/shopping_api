require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.query.id;

    if (!id) {
      const result = await db.query("SELECT * from providers");
      res.status(200).send(result.rows);
    } else {
      const result = await db.query("SELECT * from providers WHERE id = $1", [
        id,
      ]);
      if (result.rows.length <= 0) {
        res.status(404).send("Provider not found");
      } else {
        res.status(200).send(result.rows);
      }
    }
  },
};
