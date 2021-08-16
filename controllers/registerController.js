require("dotenv").config();
const db = require("@model/db");
const bcrypt = require("bcrypt");

module.exports = {
  post: async (req, res) => {
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
      res.send("Email or document already exists");
    } else {
      res.send("Register ok");
    }
  },
};
