require("dotenv").config();
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const id = req.query.id;
    const code = req.body.code;
    const discount = req.body.discount;
    const type_discount = req.body.type_discount;

    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      const check = await db.query(
        "SELECT * from promotional_codes WHERE id = $1 and deleted_at IS NULL",
        [id]
      );

      if (check.rows.length == 0) {
        res.status(404).send("Invalid ID");
      } else {
        const currentcode = check.rows[0].code;
        const currentdiscount = check.rows[0].discount;
        const currenttype_discount = check.rows[0].type_discount;

        const result = await db.query(
          "UPDATE promotional_codes SET code = $1, discount = $2, type_discount = $3 WHERE id = $4 RETURNING *",
          [
            code != undefined ? code : currentcode,
            discount != undefined ? discount : currentdiscount,
            type_discount != undefined ? type_discount : currenttype_discount,
            id,
          ]
        );
        if (result == 23505) {
          res.status(409).send("Code already exists");
        } else if (result == 23514) {
          res.status(404).send("Invalid discount type");
        } else {
          res.status(200).send(result.rows);
        }
      }
    }
  },
};
