const fs = require("fs").promises;
require("dotenv").config();
const db = require("@model/db");
const newproduct = require("@functions/AddToCart");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  post: async (req, res) => {
    const id = req.query.productid;
    const userid = await currentUserID(req);
    if (!id) {
      res.status(400).send("Please provider an ID");
    } else {
      const check = await db.query("SELECT id from products WHERE id = $1 and deleted_at IS NULL", [id]);
  
      if (check.rows.length <= 0) {
        res.status(404).send("Invalid ID");
      } else {
        const check_stock = await db.query(
          "SELECT amount from stock where product_id = $1 and deleted_at IS NULL",
          [id]
        );
        if (check_stock.rows.length <= 0 || check_stock.rows[0].amount <= 0) {
          res.status(409).send("Out of stock");
        } else {
          const price = await db.query(
            "SELECT price from products WHERE id = $1 and deleted_at IS NULL",
            [id]
          );
          await newproduct.addtocart(userid, id, price.rows[0].price);
          await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
            check_stock.rows[0].amount - 1,
            id,
          ]);
          res.status(200).send("Added to cart");
        }
      }
    }
  }
}