require("dotenv").config();
const db = require("@model/db");

module.exports = {
  delete: async (req, res) => {
    const now = new Date().toLocaleString();
    const id = req.query.id;
    if (!id) {
      res.send("Please provide an ID");
    } else {
      try {
        const result = await db.query(
          "UPDATE promotional_codes SET deleted_at = $1 WHERE ID = $2",
          [now, id]
        );
        if (result.rowCount >= 1) {
          res.send("Successfully deleted");
        } else {
          res.send("Promotional Code not found");
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
};
