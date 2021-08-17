require("dotenv").config();
const fs = require("fs").promises;
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  get: async (req, res) => {
    const userid = await currentUserID(req);
    try {
      const result = await fs.readFile(`./coupons/user${userid}.json`);
      res.setHeader("Content-Type", "application/json");
      res.send(result);
    } catch (err) {
      if (err.errno == "-4058") {
        res.send("You haven't applied a coupon");
      } else {
        console.log(err);
        res.send(err);
      }
    }
  },
};
