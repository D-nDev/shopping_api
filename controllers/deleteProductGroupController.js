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
        const check = await db.query(
          "SELECT COUNT(CASE WHEN group_id = $1 AND deleted_at IS NULL THEN 1 ELSE NULL END) FROM products",
          [id]
        );
        if (check.rows[0].count >= 1) {
          res.send(
            `You can't delete this product, because you have a product linked to this group. first delete the linked products.`
          );
        } else {
          await db.query(
            "UPDATE products_group SET deleted_at = $1 WHERE ID = $2",
            [now, id]
          );
          res.send("Successfully deleted");
        }
      } catch (err) {
        res.send(err);
      }
    }
  },
};
