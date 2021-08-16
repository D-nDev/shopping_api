require("dotenv").config();
const jwt = require("jsonwebtoken");

function currentUser(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
      //console.log(decoded.id);
      if (err) {
        console.log(err);
        resolve('0');
      } else {
        resolve(decoded.id);
      }
    });
  });
}

module.exports = { currentUser }