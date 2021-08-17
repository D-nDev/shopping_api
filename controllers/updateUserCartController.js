require("dotenv").config();
const fs = require("fs").promises;
const currentUserID = require("@functions/CurrentUserID").currentUser;
const db = require("@model/db");

module.exports = {
  put: async (req, res) => {
    const userid = await currentUserID(req);
    const id = req.query.id;
    const quantity = req.query.quantity;
    const current_cart = await fs.readFile(`./cart/cart${userid}.json`);
    const jsoncart = JSON.parse(current_cart);
    let currentquantity = 0;

    const cart_object = jsoncart.map((element) => {
      return parseInt(element.product_id);
    });

    const find_product = cart_object.indexOf(parseInt(id));

    if (find_product == -1) {
      res.status(404).send("Product not found");
    } else {
      const check_stock = await db.query(
        "SELECT amount from stock where product_id = $1",
        [id]
      );
      if (check_stock.rows[0].amount - parseInt(quantity) <= 0) {
        res.status(409).send("Out of stock");
      } else {
        if (parseInt(quantity) < jsoncart[find_product].quantity) {
          await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
            check_stock.rows[0].amount + 1,
            id,
          ]);
        } else {
          currentquantity = jsoncart[find_product].quantity;
          jsoncart[find_product].quantity = parseInt(quantity);
          jsoncart[find_product].total_price =
            parseFloat(jsoncart[find_product].unitary_price) *
            parseFloat(jsoncart[find_product].quantity).toFixed(2);
          jsoncart[find_product].total_price =
            +jsoncart[find_product].total_price.toFixed(2);

          await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
            check_stock.rows[0].amount -
              (jsoncart[find_product].quantity - currentquantity),
            id,
          ]);
          await fs.writeFile(
            `./cart/cart${userid}.json`,
            JSON.stringify(jsoncart)
          );
          res.status(200).send("Cart updated");
        }
      }
    }
  },
};
