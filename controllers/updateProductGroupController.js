require("dotenv").config();
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const id = req.query.id;
    const name = req.body.name;

    if (!id) {
      res.status(400).send("Please provide an ID");
    } else if (!name) {
      res.status(400).send("Please provide a new name");
    } else {
      const check = await db.query(
        "SELECT id, name from products_group WHERE id = $1 and deleted_at IS NULL",
        [id]
      );

      if (check.rows.length <= 0) {
        res.status(404).send("Invalid ID");
      } else {
        const result = await db.query(
          "UPDATE products_group SET name = $1 WHERE id = $2 RETURNING *",
          [name, id]
        );
        if (result == 23505) {
          res.status(409).send("Name already exists");
        } else {
          res.status(200).send(result.rows);
        }
      }
    }
  },
};
