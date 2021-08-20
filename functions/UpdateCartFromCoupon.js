require("dotenv").config();
const fs = require("fs").promises;

async function UpdateCartCoupon(userid, check) {
  try {
    const updatecart = await fs.readFile(`./cart/cart${userid}.json`);
    const updateusercart = JSON.parse(updatecart);

    updateusercart.forEach((element) => {
      element.discount_value = parseFloat(check.rows[0].discount);
      if (check.rows[0].type_discount == "fix") {
        element.unitary_price -= parseFloat(check.rows[0].discount);
        element.total_price = element.unitary_price * element.quantity;
        element.type_discount = "fix";
      } else {
        let percentage = (check.rows[0].discount / 100) * element.unitary_price;
        element.unitary_price -= percentage;
        element.total_price = element.unitary_price * element.quantity;
        element.type_discount = "percentage";
      }
    });
    await fs.writeFile(
      `./cart/cart${userid}.json`,
      JSON.stringify(updateusercart)
    );
    return "Coupon added and prices updated";
  } catch (err) {
    if (err.errno == "-4058") {
      return "Coupon added";
    } else {
      console.log(err);
      return err;
    }
  }
}

module.exports = { UpdateCartCoupon }
