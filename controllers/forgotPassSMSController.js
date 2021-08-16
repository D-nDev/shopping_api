require("dotenv").config();
const db = require("@model/db");
const crypto = require("crypto");
const forgotPass = require("@functions/SendForgotPasswordSMS");

module.exports = {
  post: async (req, res) => {
    const expire = new Date();
    expire.setHours(expire.getHours() + 2);

    const sms = req.body.number;
    const token = crypto.randomBytes(20).toString("hex");
    const result = await db.query(
      "SELECT * FROM users where (phone = $1 and deleted_at IS NULL)",
      [sms]
    );
    if (result.rows.length == 0) {
      res.send("Number not found");
    } else {
      try {
        console.log(sms);
        await Promise.all([
          forgotPass.sendSms(sms, token),
          db.query(
            "UPDATE users SET reset_code = $1, expire_time = $2 WHERE (phone = $3 AND deleted_at IS NULL)",
            [token, expire, sms]
          ),
        ]);
        res.send("SMS sent");
      } catch (err) {
        res.send(err);
      }
    }
  },
};
