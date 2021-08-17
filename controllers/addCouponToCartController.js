require("dotenv").config();
const fs = require("fs").promises;
const fs2 = require("fs");
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;
const updatecart = require("@functions/UpdateCartFromCoupon").UpdateCartCoupon;

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
    const coupon = req.query.coupon;
    const check = await db.query(
      "SELECT code, discount, type_discount from promotional_codes WHERE code = $1 and deleted_at IS NULL",
      [coupon]
    );
    if (fs2.existsSync(`./coupons/user${userid}.json`) == true) {
      res.send("You already have a coupon");
    } else if (fs2.existsSync(`./cart/cart${userid}.json`) == false) {
      res.send("You have to add a product to cart first before add a coupon.");
    } else {
      if (check.rows.length >= 1) {
        const newcode = [
          {
            code: check.rows[0].code,
            discount: parseFloat(check.rows[0].discount),
            type_discount: check.rows[0].type_discount,
          },
        ];
        await fs.writeFile(
          `./coupons/user${userid}.json`,
          JSON.stringify(newcode)
        );

        // update the cart
        const update = await updatecart(userid, check);
        res.send(update);
      } else {
        res.send("Invalid coupon");
      }
    }
  },
};
