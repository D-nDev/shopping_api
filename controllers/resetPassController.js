require("dotenv").config();
const db = require("@model/db");
const newuserpass = require("@functions/resetPass");

module.exports = {
  post: async (req, res) => {
    const newpass = req.body.newpass;
    const token = req.body.token;
    const now = new Date().toString();
    try {
      const result = await db.query(
        "SELECT * from users where reset_code = $1 and deleted_at IS NULL",
        [token]
      );
      if (result.rows.length == 0) {
        res.send("Token not found");
      } else if (result.rows[0].expire_time > now) {
        console.log(now);
        res.send("Token expired");
      } else {
        await newuserpass.resetPass(newpass, result.rows[0].reset_code);
        res.send("Password changed");
      }
    } catch (err) {
      res.send(err);
    }
  },
};
