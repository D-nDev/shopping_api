require("dotenv").config();
const db = require("@model/db");

module.exports = {
  delete: async (req, res) => {
    const id = req.query.id;
    const now = new Date().toLocaleString();
    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      try {
        const result = await db.query(
          "UPDATE products SET deleted_at = $1 WHERE (id = $2)",
          [now, id]
        );
        if (result.rowCount >= 1) {
          res.status(202).send("Successfully deleted");
        } else {
          res.status(404).send("Product not found");
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  },
};
