const fs = require("fs").promises;

async function addtocart(userid, productid) {
  try {
    // if user is trying to increase quantity of a product to it's cart
    const readcart = await fs.readFile(`./cart/cart${userid}.json`);
    const usercart = JSON.parse(readcart);
    for (let i = 0; i < usercart.length; i++) {
      if (usercart[i].product_id == productid) {
        usercart[i].quantity += 1;
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(usercart)
        );
        return true;
      }
    }

    // if user is trying to add a new product
    const newproduct = {};
    newproduct["product_id"] = productid;
    newproduct["quantity"] = 1;
    usercart.push(newproduct);
    await fs.writeFile(`./cart/cart${userid}.json`, JSON.stringify(usercart));
    return true;


  } catch (err) {
    if (err.errno == "-4058") {
      // if user doesn't have any products in it's cart
      const newproduct = [
        {
          product_id: productid,
          quantity: 1,
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
