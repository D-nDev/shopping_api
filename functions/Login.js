const bcrypt = require("bcrypt");

function LoginUser(password, userpassword) {
  return new Promise((resolve, reject) => {
    if (bcrypt.compareSync(userpassword, password)) {
      resolve("2"); // login ok, send the name back to the app.js, in order to send something to the front-end or whatever else
    } else {
      reject("1"); // incorrect password
    }
  });
}

module.exports = {
  LoginUser,
};
