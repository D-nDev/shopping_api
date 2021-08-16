require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("@model/db");

async function resetPass(newpass, token) {
  bcrypt.hash(newpass, 10, function (err, hash) {
    if (err) console.log(err);
    db.query("UPDATE users set password = $1 WHERE reset_code = $2", [
      hash,
      token,
    ]).then(() => {
      return "Ok";
    });
  });
}

module.exports = {
  resetPass,
};
