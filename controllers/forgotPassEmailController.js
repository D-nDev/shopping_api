require("dotenv").config();
const { detect } = require("detect-browser");
const os = require("os");
const browser = detect();
const db = require("@model/db");
const crypto = require("crypto");
const forgotPass = require("@functions/SendForgotPasswordEmail");

module.exports = {
  post: async (req, res) => {
    const email = req.body.email;
    const token = crypto.randomBytes(20).toString("hex");
    const result = await db.query(
      "SELECT * FROM users where (email = $1 AND deleted_at IS NULL)",
      [email]
    );
    if (result.rows.length == 0) {
      res.status(404).send("Email not found");
    } else {
      try {
        console.log(email);
        await Promise.all([
          forgotPass.sendEmail(
            email,
            token,
            browser.name,
            os.type(),
            os.release(),
            req.ip,
            result.rows[0].first_name
          ),
          db.query(
            "UPDATE users SET reset_code = $1 WHERE (email = $2 AND deleted_at IS NULL)",
            [token, email]
          ),
        ]);
        res.status(201).send("Email sent");
      } catch (err) {
        res.send(err);
      }
    }
  },
};
