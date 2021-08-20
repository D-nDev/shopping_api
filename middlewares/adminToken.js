require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyTokenAdmin = (req, res, next) => {
  jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(`${err.name}: ${err.message}`);
      return res.status(401).send("Unauthorized Admin");
    } else {
      if (decoded.roleID != 1) {
        return res.status(401).send("Unauthorized Admin");
      } else {
        next();
      }
    }
  });
}

module.exports = { verifyTokenAdmin }