require("dotenv").config();
const currentUserID = require("@functions/CurrentUserID").currentUser;
const fs = require("fs").promises;

module.exports = {
  get: async (req, res) => {
    const userid = await currentUserID(req);
    if (userid) {
      try {
        const usercart = await fs.readFile(`./cart/cart${userid}.json`);
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(usercart);
      } catch (err) {
        if (err.errno == "-4058") {
          res.status(400).send("Empty Cart");
        } else {
          console.log(err);
          res.status(500).send(err);
        }
      }
    } else {
      res.status(404).send("ID not found");
    }
  },
};
