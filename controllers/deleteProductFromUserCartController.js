require("dotenv").config();
const fs = require("fs").promises;
const currentUserID = require("@functions/CurrentUserID").currentUser;
const db = require("@model/db");

module.exports = {
  delete: async (req, res) => {
    const userid = await currentUserID(req);
    const id = req.query.id;

    const current_cart = await fs.readFile(`./cart/cart${userid}.json`);
    const jsoncart = JSON.parse(current_cart);
    const current_stock = await db.query(
      "SELECT amount from stock where product_id = $1",
      [id]
    );

    const cart_object = jsoncart.map((element) => {
      return parseInt(element.product_id);
    });

    const find_product = cart_object.indexOf(parseInt(id));

    if (find_product == -1) {
      res.send("Product not found");
    } else {
      await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
        current_stock.rows[0].amount + jsoncart[find_product].quantity,
        id,
      ]);
      if (jsoncart.length == 1) {
        fs.unlink(`./cart/cart${userid}.json`);
        res.send("Cart deleted");
      } else {
        jsoncart.splice(find_product, 1);
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(jsoncart)
        );
        res.send("Product removed from cart");
      }
    }
  },
};
