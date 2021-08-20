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
        "SELECT reset_code, expire_time from users where reset_code = $1 and deleted_at IS NULL",
        [token]
      );
      if (result.rows.length <= 0) {
        res.status(404).send("Token not found");
      } else if (new Date(now).getTime() > new Date(result.rows[0].expire_time).getTime()) {
        res.status(400).send("Token expired");
      } else {
        await newuserpass.resetPass(newpass, result.rows[0].reset_code);
        res.status(200).send("Password changed");
      }
    } catch (err) {
      res.send(err);
    }
  },
};
