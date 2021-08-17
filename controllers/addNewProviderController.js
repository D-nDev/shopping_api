require("dotenv").config();
const db = require("@model/db");

module.exports = {
  post: async (req, res) => {
    const document = req.body.document;
    const name = req.body.name;
    const country = req.body.country;
    const state = req.body.state;
    const product_type = req.body.product_type;
    const phone = req.body.phone;
    const zip_code = req.body.zip_code;
    try {
      const result = await db.query(
        "INSERT INTO providers(document, name, country, state, product_type, phone, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [document, name, country, state, product_type, phone, zip_code]
      );
      if (result == 23505) {
        res.status(400).send("Document already exists");
      } else {
        res.status(201).send(result.rows[0]);
      }
    } catch (err) {
      res.send(err);
    }
  },
};
