require("dotenv").config();
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const id = req.query.id;
    const name = req.body.name;
    const portion = req.body.portion;
    const daystopay = req.body.daystopay;

    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      try {
        const check = await db.query(
          "SELECT id, name, portion_quantity from payment_method WHERE id = $1 and deleted_at IS NULL",
          [id]
        );

        if (check.rows.length <= 0) {
          res.status(404).send("Invalid ID");
        } else {
          const currentname = check.rows[0].name;
          const currentportion = check.rows[0].portion_quantity;
          const currentdaystopay = check.rows[0].daystopay;

          const result = await db.query(
            "UPDATE payment_method SET name = $1, portion_quantity = $2, daystopay = $3 WHERE id = $4 RETURNING *",
            [
              name != undefined ? name : currentname,
              portion != undefined ? portion : currentportion,
              daystopay != undefined ? daystopay : currentdaystopay,
              id,
            ]
          );
          if (result.code == 23505) {
            res.status(409).send("Payment method already exists");
          } else {
            res.status(200).send(result.rows);
          }
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  },
};
