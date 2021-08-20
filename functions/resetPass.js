require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("@model/db");

async function resetPass(newpass, token) {
  bcrypt.hash(newpass, 10, function (err, hash) {
    if (err) console.log(err);
    db.query("UPDATE users set password = $1, reset_code = $2, expire_time = $3 WHERE reset_code = $4", [
      hash,
      null,
      null,
      token,
    ]).then(() => {
      return "Ok";
    });
  });
}

module.exports = {
  resetPass,
};
