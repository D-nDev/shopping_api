process.env.TZ = 'America/Sao_Paulo';
require("dotenv").config();
const express = require("express");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const login = require("./controllers/login");
const resetemail = require("./controllers/sendemail");
const resetsms = require("./controllers/sendsms");
const resetpass = require("./controllers/resetpass");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const useragent = require("express-useragent");
const { detect } = require("detect-browser");
const os = require("os");
const browser = detect();
const app = express();

const router = express.Router();

app.use(useragent.express());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser("1234"));

router.get("/test", async (req, res) => {
  const result = await db.query("SELECT * from users", []);
  res.send(result.rows);
});

router.get("/test2", async (req, res) => {
  const result = await db.query(
    "SELECT * from users where (id = $1 AND deleted_at IS NULL)",
    [1]
  );
  res.send(result.rows);
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = await db.query(
    "SELECT * from users where (email = $1 AND deleted_at IS NULL)",
    [email]
  );
  if (result.rows.length >= 1) {
    try {
      const loginuser = await login.LoginUser(
        result.rows[0].password,
        password
      );
      //console.log(result.rows);
      res.send(loginuser);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("0");
  }
});

router.post("/register", async (req, res) => {
  const document = req.body.document;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const phone = req.body.phone;
  const birthdate = req.body.birthdate;

  const result = await db.query(
    "INSERT INTO users(document, email, password, first_name, last_name, address, city, state, zip_code, phone, birth_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
      document,
      email,
      password,
      firstname,
      lastname,
      address,
      city,
      state,
      zipcode,
      phone,
      birthdate,
    ]
  );
  if (result == 23505) {
    res.send("Email already exists");
  } else {
    res.send("Register ok");
  }
});

router.post("/requestpass_email", async (req, res) => {
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString("hex");
  const result = await db.query(
    "SELECT * FROM users where (email = $1 AND deleted_at IS NULL)",
    [email]
  );
  if (result.rows.length == 0) {
    res.send("Email not found");
  } else {
    try {
      console.log(email);
      await Promise.all([
        resetemail.sendEmail(
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
      res.send("Email sent");
    } catch (err) {
      res.send(err);
    }
  }
});

router.post("/requestpass_sms", async (req, res) => {
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
        resetsms.sendSms(sms, token),
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
});

router.post("/resetpass", async (req, res) => {
  const newpass = req.body.newpass;
  const token = req.body.token;
  const now = new Date().toString();
  try {
    const result = await db.query("SELECT * from users where reset_code = $1", [token]);
    if(result.rows.length == 0) {
      res.send("Token not found")
    }
    else if(result.rows[0].expire_time > now) {
      console.log(now);
      res.send("Token expired");
    }
    else {
      await resetpass.resetPass(newpass, result.rows[0].reset_code);
      res.send("Password changed");
    }
  } catch (err) {
    res.send(err);
  }
});

router.delete("/deleteaccount", async (req, res) => {
  const email = req.session.email;
  try {
    await db.query("DELETE FROM users where email = $1", [email]);
    res.send("Ok");
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
