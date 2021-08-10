const express = require("express");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const app = express();

const router = express.Router();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser("1234"));

router.get("/test", async (req, res) => {
  const result = await db.query("SELECT * from users", [])
  res.send(result.rows);
});

module.exports = router;
