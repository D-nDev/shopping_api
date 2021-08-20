require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
    const productid = req.query.productid;
    const amount = req.query.amount;

    if (!productid) {
      res.status(400).send("Please fill the product id");
    } else if (!amount) {
      res.status(400).send("Please fill the amount");
    } else {
      try {
        const newstock = await db.query(
          "INSERT INTO stock(product_id, amount, creation_userid) VALUES ($1, $2, $3) RETURNING *",
          [productid, amount, userid]
        );

        if(newstock.severity) {
          if(newstock.code == 23503) {
            res.status(500).send("Product ID not found");
          }
          else {
            res.status(500).send("An error has ocurred, please contact the administrator");
          }
        }
        else {
          res.status(201).send("Stock added");
        }
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  },
};
