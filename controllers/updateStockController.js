require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  put: async (req, res) => {
    const userid = await currentUserID(req);
    const productid = req.query.productid;
    const amount = req.query.amount;

    if (!productid) {
      res.status(400).send("Please fill the product id");
    } else if (!amount) {
      res.status(400).send("Please fill the amount");
    } else {
      const check = await db.query(
        "SELECT product_id from stock where product_id = $1 and deleted_at IS NULL",
        [productid]
      );
      if (check.rows.length <= 0) {
        res.status(404).send("Product not found");
      } else {
        try {
          const updatestock = await db.query(
            "UPDATE stock SET amount = $1, update_userid = $2 WHERE product_id = $3 RETURNING *",
            [amount, userid, check.rows[0].product_id]
          );

          if (updatestock.severity) {
            if (newstock.code == 23503) {
              res.status(500).send("Product ID not found");
            } else {
              res
                .status(500)
                .send("An error has ocurred, please contact the administrator");
            }
          } else {
            res.status(201).send("Stock updated");
          }
        } catch (err) {
          console.log(err);
          res.status(500).send(err);
        }
      }
    }
  },
};
