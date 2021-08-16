require("dotenv").config();
const db = require("@model/db");

module.exports = {
  delete: async (req, res) => {
    const id = req.query.id;
    const now = new Date().toLocaleString();
    if (!id) {
      res.send("Please provide an ID");
    } else {
      try {
        const result = await db.query(
          "UPDATE products SET deleted_at = $1 WHERE (id = $2)",
          [now, id]
        );
        if (result.rowCount >= 1) {
          res.send("Successfully deleted");
        } else {
          res.send("error");
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
};
