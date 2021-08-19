require("dotenv").config();
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const id = req.query.id;
    const document = req.body.document;
    const name = req.body.name;
    const country = req.body.country;
    const state = req.body.state;
    const product_type = req.body.product_type;
    const phone = req.body.phone;
    const zip_code = req.body.zip_code;

    if (!id) {
      res.status(400).send("Please provide an ID");
    } else {
      try {
        const check = await db.query(
          "SELECT * from providers WHERE id = $1 and deleted_at IS NULL",
          [id]
        );

        if (check.rows.length == 0) {
          res.status(404).send("Invalid ID");
        } else {
          const currentdocument = check.rows[0].document;
          const currentname = check.rows[0].name;
          const currentcountry = check.rows[0].country;
          const currentstate = check.rows[0].state;
          const currentproduct_type = check.rows[0].product_type;
          const currentphone = check.rows[0].phone;
          const currentzip_code = check.rows[0].zip_code;

          const result = await db.query(
            "UPDATE providers SET document = $1, name = $2, country = $3, state = $4, product_type = $5, phone = $6, zip_code = $7 WHERE id = $8 RETURNING *",
            [
              document != undefined ? document : currentdocument,
              name != undefined ? name : currentname,
              country != undefined ? country : currentcountry,
              state != undefined ? state : currentstate,
              product_type != undefined ? product_type : currentproduct_type,
              phone != undefined ? phone : currentphone,
              zip_code != undefined ? zip_code : currentzip_code,
              id,
            ]
          );
          if (result.code == 23505) {
            res.status(409).send("Document or phone already exists");
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
