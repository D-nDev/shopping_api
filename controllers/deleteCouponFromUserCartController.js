require("dotenv").config();
const fs = require("fs").promises;
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  delete: async (req, res) => {
    const userid = await currentUserID(req);
    try {
      await fs.unlink(`./coupons/user${userid}.json`);
      try {
        const updatecart = await fs.readFile(`./cart/cart${userid}.json`);
        const updateusercart = JSON.parse(updatecart);

        updateusercart.forEach((element) => {
          if (element.type_discount == "fix") {
            element.unitary_price = element.original_value;
            element.total_price = element.unitary_value * element.quantity;
            element.type_discount = "none";
            element.discount_value = 0;
          } else {
            element.unitary_price = element.original_value;
            element.total_price = element.original_value * element.quantity;
            element.type_discount = "none";
            element.discount_value = 0;
          }
        });
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(updateusercart)
        );
        res.send("Deleted");
      } catch (err) {
        if (err.errno == "-4058") {
          res.send("Can't open the file");
        } else {
          console.log(err);
          res.send(err);
        }
      }
    } catch (err) {
      if (err.errno == "-4058") {
        res.send("File doesn't exists");
      } else {
        console.log(err);
        res.send(err);
      }
    }
  },
};
