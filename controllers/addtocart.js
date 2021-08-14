const fs = require("fs").promises;

async function addtocart(userid, productid, price) {
  try {
    // if user is trying to increase quantity of a product to it's cart
    const readcart = await fs.readFile(`./cart/cart${userid}.json`);
    const usercart = JSON.parse(readcart);
    for (let i = 0; i < usercart.length; i++) {
      if (usercart[i].product_id == productid) {
        usercart[i].quantity += 1;
        usercart[i].total_price += usercart[i].unitary_price;
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(usercart)
        );
        return true;
      }
    }

    // if user is trying to add a new product
    try {
      const newproduct = {};
      const result = await fs.readFile(`./coupons/user${userid}.json`);
      const updatecoupon = JSON.parse(result);
      if (updatecoupon[0].type_discount == "fix") {
        newproduct["product_id"] = productid;
        newproduct["quantity"] = 1;
        newproduct["unitary_price"] =
          parseFloat(price) - parseFloat(updatecoupon[0].discount);
        newproduct["total_price"] =
          parseFloat(price) - parseFloat(updatecoupon[0].discount);
        newproduct["original_value"] = parseFloat(price);
        newproduct["discount_value"] = updatecoupon[0].discount;
        newproduct["plus_value"] = 0;
        newproduct["type_discount"] = updatecoupon[0].type_discount;
        usercart.push(newproduct);
      } else if (updatecoupon[0].type_discount == "percentage") {
        let percentage =
          (parseFloat(updatecoupon[0].discount) / 100) * parseFloat(price);
        newproduct["product_id"] = productid;
        newproduct["quantity"] = 1;
        newproduct["unitary_price"] = price - percentage;
        newproduct["total_price"] = price - percentage;
        newproduct["original_value"] = parseFloat(price);
        newproduct["discount_value"] = updatecoupon[0].discount;
        newproduct["plus_value"] = 0;
        newproduct["type_discount"] = updatecoupon[0].type_discount;
        usercart.push(newproduct);
      }
      await fs.writeFile(`./cart/cart${userid}.json`, JSON.stringify(usercart));
      return true;
    } catch (err) {
      if (err.errno == "-4058") {
        const newproduct = {};
        newproduct["product_id"] = productid;
        newproduct["quantity"] = 1;
        newproduct["unitary_price"] = parseFloat(price);
        newproduct["total_price"] = parseFloat(price);
        newproduct["original_value"] = parseFloat(price);
        newproduct["discount_value"] = 0;
        newproduct["plus_value"] = 0;
        newproduct["type_discount"] = "none";
        usercart.push(newproduct);
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(usercart)
        );
        return true;
      }
    }
  } catch (err) {
    if (err.errno == "-4058") {
      // if user doesn't have any products in it's cart
      const newproduct = [
        {
          product_id: productid,
          quantity: 1,
          unitary_price: parseFloat(price),
          total_price: parseFloat(price),
          original_value: parseFloat(price),
          discount_value: 0,
          plus_value: 0,
          type_discount: "none",
        },
      ];
      await fs.writeFile(
        `./cart/cart${userid}.json`,
        JSON.stringify(newproduct)
      );
      return true;
    } else {
      console.log(err);
      return err;
    }
  }
}

module.exports = { addtocart };
