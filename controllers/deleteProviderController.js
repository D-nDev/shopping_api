require("dotenv").config();
const db = require("@model/db");

module.exports = {
  delete: async (req, res) => {
    const now = new Date().toLocaleString();
    const id = req.query.id;
    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      try {
        const result = await db.query(
          "UPDATE providers SET deleted_at = $1 WHERE ID = $2",
          [now, id]
        );
        if (result.rowCount >= 1) {
          res.status(202).send("Successfully deleted");
        } else {
          res.status(404).send("Provider ID not found");
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  },
};
