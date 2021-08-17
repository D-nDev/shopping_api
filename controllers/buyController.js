require("dotenv").config();
const fs2 = require("fs");
const currentUserID = require("@functions/CurrentUserID").currentUser;
const buy = require("@functions/Buy").buy;

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
    const method = req.body.method;
    const today = new Date().toLocaleString();
    let todayconverted = new Date(today);
    if (userid && fs2.existsSync(`./cart/cart${userid}.json`)) {
      const requestbuy = await buy(todayconverted, userid, method);
      if (requestbuy != "Payment successfully") {
        res.status(404).send(requestbuy);
      } else {
        res.status(200).send(requestbuy);
      }
    } else {
      res.status(404).send("User ID not found or empty cart");
    }
  },
};
