const express = require("express");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const login = require("./controllers/login");
const bcrypt = require("bcrypt");
const app = express();

const router = express.Router();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser("1234"));

router.get("/test", async (req, res) => {
  const result = await db.query("SELECT * from users", []);
  res.send(result.rows);
});

router.get("/test2", async (req, res) => {
  const result = await db.query("SELECT * from users where id = $1", [1]);
  res.send(result.rows);
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = await db.query("SELECT * from users where email = $1", [
    email,
  ]);
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

module.exports = router;
