require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  get: async (req, res) => {
    const userid = await currentUserID(req);
    const saleheaderid = req.query.saleheaderid;

    try {
      const result = await db.query(
        `
    SELECT
      pr.name
      ,pr.description
      ,sale.sold_amount
      ,sale.unitary_value
      ,sale.total
      ,(SELECT user_id from sale_header where id = sale.sale_header_id)
      ,(SELECT id from sale_header where id = sale.sale_header_id) as "sale_header_id"
    FROM products pr
    INNER JOIN sale_items sale ON sale.product_id = pr.id
    WHERE (SELECT user_id from sale_header where id = sale.sale_header_id) = $1 AND (SELECT id from sale_header where id = sale.sale_header_id) = $2`,
        [userid, saleheaderid]
      );
      if(result.rows.length <= 0) {
        res.status(404).send("Order not found");
      }
      else {
        res.status(200).send(result.rows);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error, please contact administrator");
    }
  },
};
