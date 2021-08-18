require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("@model/db");
const Login = require("@functions/Login");

module.exports = {
  post: async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const result = await db.query(
      "SELECT id, email, first_name, role_id, password from users where (email = $1 AND deleted_at IS NULL)",
      [email]
    );
    if (result.rows.length >= 1) {
      try {
        await Login.LoginUser(result.rows[0].password, password);
        const token = jwt.sign(
          {
            id: result.rows[0].id,
            email: email,
            name: result.rows[0].first_name,
            roleID: result.rows[0].role_id,
          },
          process.env.SECRET
        );
        res.cookie("usertoken", token, {
          httpOnly: true,
        });
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (err) {
            console.log(err);
            res.status(401).send("Unauthorized");
          } else {
            console.log(decoded);
            res.send(true);
          }
        });
      } catch (err) {
        if (err == 1) {
          res.status(403).send("1");
        } else {
          res.send(err);
        }
      }
    } else {
      res.status(404).send("0");
    }
  },
};
