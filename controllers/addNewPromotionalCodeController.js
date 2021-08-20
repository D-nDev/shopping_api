require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
    const code = req.body.code;
    const discount = req.body.discount;
    const type_discount = req.body.type_discount;
    try {
      const result = await db.query(
        "INSERT INTO promotional_codes(code, discount, type_discount, creation_userid) VALUES ($1, $2, $3, $4) RETURNING *",
        [code, discount, type_discount, userid]
      );
      if (result.code == 23505) {
        res.status(400).send("Code already exists");
      } else if (result.code == 23514) {
        res.status(404).send("Invalid discount type");
      } else {
        res.status(201).send(result.rows[0]);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },
};
