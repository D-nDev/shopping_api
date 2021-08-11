process.env.TZ = "America/Sao_Paulo";
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const login = require("./controllers/login");
const resetemail = require("./controllers/sendemail");
const resetsms = require("./controllers/sendsms");
const resetpass = require("./controllers/resetpass");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { detect } = require("detect-browser");
const os = require("os");
const browser = detect();
const app = express();

const router = express.Router();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser("1234"));

router.get("/test", verifyToken, async (req, res) => {
  const result = await db.query("SELECT * from users", []);
  res.send(result.rows);
});

router.get("/test2", async (req, res) => {
  const result = await db.query(
    "SELECT * from users where (id = $1 AND deleted_at IS NULL)",
    [1]
  );
  res.send(result.rows);
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const result = await db.query(
    "SELECT * from users where (email = $1 AND deleted_at IS NULL)",
    [email]
  );
  if (result.rows.length >= 1) {
    try {
      await login.LoginUser(result.rows[0].password, password);
      //console.log(result.rows);
      const token = jwt.sign(
        {
          id: result.rows[0].id,
          email: email,
          name: result.rows[0].first_name,
          roleID: result.rows[0].role_id,
        },
        process.env.SECRET
      );
      res.cookie("usertoken", token, {
        httpOnly: true,
      });
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          console.log(err);
          res.status(401).send("Unauthorized");
        } else {
          console.log(decoded);
          res.send(true);
        }
      });
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("0");
  }
});

router.post("/logout", (req, res) => {
  res.status(202).clearCookie("usertoken").send("cookies cleared");
});

router.post("/register", async (req, res) => {
  const document = req.body.document;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const phone = req.body.phone;
  const birthdate = req.body.birthdate;

  const result = await db.query(
    "INSERT INTO users(document, email, password, first_name, last_name, address, city, state, zip_code, phone, birth_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
      document,
      email,
      password,
      firstname,
      lastname,
      address,
      city,
      state,
      zipcode,
      phone,
      birthdate,
    ]
  );
  if (result == 23505) {
    res.send("Email already exists");
  } else {
    res.send("Register ok");
  }
});

router.post("/requestpass_email", async (req, res) => {
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString("hex");
  const result = await db.query(
    "SELECT * FROM users where (email = $1 AND deleted_at IS NULL)",
    [email]
  );
  if (result.rows.length == 0) {
    res.send("Email not found");
  } else {
    try {
      console.log(email);
      await Promise.all([
        resetemail.sendEmail(
          email,
          token,
          browser.name,
          os.type(),
          os.release(),
          req.ip,
          result.rows[0].first_name
        ),
        db.query(
          "UPDATE users SET reset_code = $1 WHERE (email = $2 AND deleted_at IS NULL)",
          [token, email]
        ),
      ]);
      res.send("Email sent");
    } catch (err) {
      res.send(err);
    }
  }
});

router.post("/requestpass_sms", async (req, res) => {
  const expire = new Date();
  expire.setHours(expire.getHours() + 2);

  const sms = req.body.number;
  const token = crypto.randomBytes(20).toString("hex");
  const result = await db.query(
    "SELECT * FROM users where (phone = $1 and deleted_at IS NULL)",
    [sms]
  );
  if (result.rows.length == 0) {
    res.send("Number not found");
  } else {
    try {
      console.log(sms);
      await Promise.all([
        resetsms.sendSms(sms, token),
        db.query(
          "UPDATE users SET reset_code = $1, expire_time = $2 WHERE (phone = $3 AND deleted_at IS NULL)",
          [token, expire, sms]
        ),
      ]);
      res.send("SMS sent");
    } catch (err) {
      res.send(err);
    }
  }
});

router.post("/resetpass", async (req, res) => {
  const newpass = req.body.newpass;
  const token = req.body.token;
  const now = new Date().toString();
  try {
    const result = await db.query("SELECT * from users where reset_code = $1", [
      token,
    ]);
    if (result.rows.length == 0) {
      res.send("Token not found");
    } else if (result.rows[0].expire_time > now) {
      console.log(now);
      res.send("Token expired");
    } else {
      await resetpass.resetPass(newpass, result.rows[0].reset_code);
      res.send("Password changed");
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addproduct", verifyToken, async (req, res) => {
  const group_id = req.body.group_id;
  const name = req.body.name;
  const price = req.body.price;
  const description = req.body.description;
  try {
    const result = await db.query(
      "INSERT INTO products(group_id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [group_id, name, price, description]
    );
    if(result == 23503) {
      res.send("Invalid Product Group ID");
    }
    else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addgroup", verifyToken, async (req, res) => {
  const name = req.body.name;
  try {
    const result = await db.query(
      "INSERT INTO products_group(name) VALUES ($1) RETURNING *",
      [name]
    );
    if(result == 23505) {
      res.send("Group Name already exists");
    }
    else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addprovider", verifyToken, async (req, res) => {
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
    if(result == 23505) {
      res.send("Document already exists");
    }
    else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addcode", verifyToken, async (req, res) => {
  const code = req.body.code;
  const discount = req.body.discount;
  const type_discount = req.body.type_discount;
  try {
    const result = await db.query(
      "INSERT INTO promotional_codes(code, discount, type_discount) VALUES ($1, $2, $3) RETURNING *",
      [code, discount, type_discount]
    );
    if(result == 23505) {
      res.send("Code already exists");
    }
    else if(result == 23514) {
      res.send("Invalid discount type");
    }
    else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});


router.delete("/deleteaccount", async (req, res) => {
  const email = req.session.email;
  try {
    await db.query("DELETE FROM users where email = $1", [email]);
    res.send("Ok");
  } catch (err) {
    res.send(err);
  }
});

function verifyToken(req, res, next) {
  jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(`${err.name}: ${err.message}`);
      return res.status(401).send("Unauthorized");
    } else {
      if (req.url === "/addproduct" || req.url === "/addgroup" && decoded.roleID != 1) {
        return res.status(401).send("Unauthorized");
      } else {
        //console.log(`Valid Token and usertype`);
        next();
      }
    }
  });
}

module.exports = router;
