require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(`${err.name}: ${err.message}`);
      return res.status(401).send("Unauthorized");
    } else {
      next();
    }
  });
}

module.exports = { verifyToken }