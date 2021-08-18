require("dotenv").config();
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const id = req.query.id;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;

    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      const check = await db.query(
        "SELECT id, name, description, price from products WHERE id = $1 and deleted_at IS NULL",
        [id]
      );

      if (check.rows.length <= 0) {
        res.status(404).send("Invalid ID");
      } else {
        const currentname = check.rows[0].name;
        const currentdescription = check.rows[0].description;
        const currentprice = check.rows[0].price;

        const result = await db.query(
          "UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *",
          [
            name != undefined ? name : currentname,
            description != undefined ? description : currentdescription,
            price != undefined ? price : currentprice,
            id,
          ]
        );
        res.status(200).send(result.rows);
      }
    }
  },
};
