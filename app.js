require("dotenv").config();
process.env.TZ = "America/Sao_Paulo";
const express = require("express");
const compression = require("compression");
const cookie_parser = require("cookie-parser");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const dateoptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "America/Sao_Paulo",
};

const app = express();
const port = process.env.port || 3000;

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "requests.log"),
  { flags: "a" }
);

app.use(
  morgan(
    `:method :url :response-time ms\nDATE: ${new Date().toLocaleDateString(
      "en-US",
      dateoptions
    )}\nHTTP STATUS CODE: :status\n`,
    { stream: accessLogStream }
  )
);
app.use(compression());
app.use(cookie_parser("1234")); // force to sign the cookie
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

app.disable("x-powered-by");

app.use(require("./routes")); // require all routes created on routes.js

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
