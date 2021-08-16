//test
process.env.TZ = "America/Sao_Paulo";
require("dotenv").config();
const express = require("express");
const fs = require("fs").promises;
const fs2 = require("fs");
const jwt = require("jsonwebtoken");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const login = require("./controllers/login");
const resetemail = require("./controllers/sendemail");
const contact = require("./controllers/sendcontactmail");
const refund = require("./controllers/sendrefundmail");
const successrefund = require("./controllers/sendrefundsuccessmail");
const resetsms = require("./controllers/sendsms");
const resetpass = require("./controllers/resetpass");
const addtocart = require("./controllers/addtocart");
const buy = require("./controllers/buy");
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
    res.send("Email or document already exists");
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
    const result = await db.query("SELECT * from users where reset_code = $1 and deleted_at IS NULL", [
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

router.post("/addproduct", verifyTokenAdmin, async (req, res) => {
  const group_id = req.body.group_id;
  const name = req.body.name;
  const price = req.body.price;
  const description = req.body.description;
  try {
    const result = await db.query(
      "INSERT INTO products(group_id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [group_id, name, price, description]
    );
    if (result == 23503) {
      res.send("Invalid Product Group ID");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addgroup", verifyTokenAdmin, async (req, res) => {
  const name = req.body.name;
  try {
    const result = await db.query(
      "INSERT INTO products_group(name) VALUES ($1) RETURNING *",
      [name]
    );
    if (result == 23505) {
      res.send("Group Name already exists");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addprovider", verifyTokenAdmin, async (req, res) => {
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
    if (result == 23505) {
      res.send("Document already exists");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addcode", verifyTokenAdmin, async (req, res) => {
  const code = req.body.code;
  const discount = req.body.discount;
  const type_discount = req.body.type_discount;
  try {
    const result = await db.query(
      "INSERT INTO promotional_codes(code, discount, type_discount) VALUES ($1, $2, $3) RETURNING *",
      [code, discount, type_discount]
    );
    if (result == 23505) {
      res.send("Code already exists");
    } else if (result == 23514) {
      res.send("Invalid discount type");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/addpaymentmethod", verifyTokenAdmin, async (req, res) => {
  const name = req.body.name;
  const portion = req.body.portion;
  try {
    const result = await db.query(
      "INSERT INTO payment_method(name, portion_quantity) VALUES ($1, $2) RETURNING *",
      [name, portion]
    );
    if (result == 23505) {
      res.send("Method already exists");
    } else {
      res.send(result.rows[0]);
    }
  } catch (err) {
    res.send(err);
  }
});

router.delete("/deleteproduct", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const now = new Date().toLocaleString();
  if (!id) {
    res.send("Please provide an ID");
  } else {
    try {
      const result = await db.query(
        "UPDATE products SET deleted_at = $1 WHERE (id = $2)",
        [now, id]
      );
      if (result.rowCount >= 1) {
        res.send("Successfully deleted");
      } else {
        res.send("error");
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.delete("/deletegroup", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const now = new Date().toLocaleString();
  if (!id) {
    res.send("Please provide an ID");
  } else {
    try {
      const check = await db.query(
        "SELECT COUNT(CASE WHEN group_id = $1 AND deleted_at IS NULL THEN 1 ELSE NULL END) FROM products",
        [id]
      );
      if (check.rows[0].count >= 1) {
        res.send(
          `You can't delete this product, because you have a product linked to this group. first delete the linked products.`
        );
      } else {
        await db.query(
          "UPDATE products_group SET deleted_at = $1 WHERE ID = $2",
          [now, id]
        );
        res.send("Successfully deleted");
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.delete("/deleteprovider", verifyTokenAdmin, async (req, res) => {
  const now = new Date().toLocaleString();
  const id = req.query.id;
  if (!id) {
    res.send("Please provide an ID");
  } else {
    try {
      const result = await db.query(
        "UPDATE providers SET deleted_at = $1 WHERE ID = $2",
        [now, id]
      );
      if (result.rowCount >= 1) {
        res.send("Successfully deleted");
      } else {
        res.send("error");
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.delete("/deletecode", verifyTokenAdmin, async (req, res) => {
  const now = new Date().toLocaleString();
  const id = req.query.id;
  if (!id) {
    res.send("Please provide an ID");
  } else {
    try {
      const result = await db.query(
        "UPDATE promotional_codes SET deleted_at = $1 WHERE ID = $2",
        [now, id]
      );
      if (result.rowCount >= 1) {
        res.send("Successfully deleted");
      } else {
        res.send("error");
      }
    } catch (err) {
      res.send(err);
    }
  }
});

router.delete("/deletepaymentmethod", verifyTokenAdmin, async (req, res) => {
  const now = new Date().toLocaleString();
  const id = req.query.id;
  if (!id) {
    res.send("Please provide an ID");
  } else {
    try {
      const result = await db.query(
        "UPDATE payment_method SET deleted_at = $1 WHERE ID = $2",
        [now, id]
      );
      if (result.rowCount >= 1) {
        res.send("Successfully deleted");
      } else {
        res.send("error");
      }
    } catch (err) {
      res.send(err);
    }
  }
});

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


router.delete("/deleteaccount", verifyTokenAdmin, async (req, res) => {
  const now = new Date().toLocaleString();
  const id = req.query.id;
  try {
    //console.log(id);
    const currentuser = await currentUser(req);
    const check = await db.query("SELECT id from users WHERE id = $1 and deleted_at IS NULL", [id]);

    if (check.rows[0].id == currentuser) {
      res.send("You can't delete yourself, try to do it in another account");
    } else {
      await db.query("UPDATE users SET deleted_at = $1 WHERE id = $2", [
        now,
        id,
      ]);
      res.send("Successfully deleted");
    }
  } catch (err) {
    res.send(err);
  }
});

router.get("/product", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const result = await db.query("SELECT * from products");
    res.send(result.rows);
  } else {
    const result = await db.query("SELECT * from products WHERE id = $1", [id]);
    res.send(result.rows);
  }
});

router.get("/group", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const result = await db.query("SELECT * from products_group");
    res.send(result.rows);
  } else {
    const result = await db.query(
      "SELECT * from products_group WHERE id = $1",
      [id]
    );
    res.send(result.rows);
  }
});

router.get("/provider", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const result = await db.query("SELECT * from providers");
    res.send(result.rows);
  } else {
    const result = await db.query("SELECT * from providers WHERE id = $1", [
      id,
    ]);
    res.send(result.rows);
  }
});

router.get("/code", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const result = await db.query("SELECT * from promotional_codes");
    res.send(result.rows);
  } else {
    const result = await db.query(
      "SELECT * from promotional_codes WHERE id = $1",
      [id]
    );
    res.send(result.rows);
  }
});

router.get("/paymentmethod", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    const result = await db.query("SELECT * from payment_method");
    res.send(result.rows);
  } else {
    const result = await db.query(
      "SELECT * from payment_method WHERE id = $1 and deleted_at IS NULL",
      [id]
    );
    res.send(result.rows);
  }
});

router.put("/product", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;

  if (!id) {
    res.send("Please provide an ID");
  } else {
    const check = await db.query("SELECT * from products WHERE id = $1 and deleted_at IS NULL", [id]);

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const currentname = check.rows[0].name;
      const currentdescription = check.rows[0].description;
      const currentprice = check.rows[0].price;

      const result = await db.query(
        "UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4",
        [
          name != undefined ? name : currentname,
          description != undefined ? description : currentdescription,
          price != undefined ? price : currentprice,
          id,
        ]
      );
      res.send(result);
    }
  }
});

router.put("/group", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const name = req.body.name;

  if (!id) {
    res.send("Please provide an ID");
  } else if (!name) {
    res.send("Please provide a new name");
  } else {
    const check = await db.query("SELECT * from products_group WHERE id = $1 and deleted_at IS NULL", [
      id,
    ]);

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const result = await db.query(
        "UPDATE products_group SET name = $1 WHERE id = $2",
        [name, id]
      );
      if (result == 23505) {
        res.send("Name already exists");
      } else {
        res.send(result);
      }
    }
  }
});

router.put("/provider", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const document = req.body.document;
  const name = req.body.name;
  const country = req.body.country;
  const state = req.body.state;
  const product_type = req.body.product_type;
  const phone = req.body.phone;
  const zip_code = req.body.zip_code;

  if (!id) {
    res.send("Please provide an ID");
  } else {
    const check = await db.query("SELECT * from providers WHERE id = $1 and deleted_at IS NULL", [id]);

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const currentdocument = check.rows[0].document;
      const currentname = check.rows[0].name;
      const currentcountry = check.rows[0].country;
      const currentstate = check.rows[0].state;
      const currentproduct_type = check.rows[0].product_type;
      const currentphone = check.rows[0].phone;
      const currentzip_code = check.rows[0].zip_code;

      const result = await db.query(
        "UPDATE providers SET document = $1, name = $2, country = $3, state = $4, product_type = $5, phone = $6, zip_code = $7 WHERE id = $8",
        [
          document != undefined ? document : currentdocument,
          name != undefined ? name : currentname,
          country != undefined ? country : currentcountry,
          state != undefined ? state : currentstate,
          product_type != undefined ? product_type : currentproduct_type,
          phone != undefined ? phone : currentphone,
          zip_code != undefined ? zip_code : currentzip_code,
          id,
        ]
      );
      if (result == 23505) {
        res.send("Document or phone already exists");
      } else {
        res.send(result);
      }
    }
  }
});

router.put("/code", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const code = req.body.code;
  const discount = req.body.discount;
  const type_discount = req.body.type_discount;

  if (!id) {
    res.send("Please provide an ID");
  } else {
    const check = await db.query(
      "SELECT * from promotional_codes WHERE id = $1 and deleted_at IS NULL",
      [id]
    );

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const currentcode = check.rows[0].code;
      const currentdiscount = check.rows[0].discount;
      const currenttype_discount = check.rows[0].type_discount;

      const result = await db.query(
        "UPDATE promotional_codes SET code = $1, discount = $2, type_discount = $3 WHERE id = $4",
        [
          code != undefined ? code : currentcode,
          discount != undefined ? discount : currentdiscount,
          type_discount != undefined ? type_discount : currenttype_discount,
          id,
        ]
      );
      if (result == 23505) {
        res.send("Code already exists");
      } else if (result == 23514) {
        res.send("Invalid discount type");
      } else {
        res.send(result);
      }
    }
  }
});

router.put("/paymentmethod", verifyTokenAdmin, async (req, res) => {
  const id = req.query.id;
  const name = req.body.name;
  const portion = req.body.portion;

  if (!id) {
    res.send("Please provide an ID");
  } else {
    const check = await db.query("SELECT * from payment_method WHERE id = $1 and deleted_at IS NULL", [
      id,
    ]);

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const currentname = check.rows[0].name;
      const currentportion = check.rows[0].portion_quantity;

      const result = await db.query(
        "UPDATE payment_method SET name = $1, portion_quantity = $2 WHERE id = $3",
        [
          name != undefined ? name : currentname,
          portion != undefined ? portion : currentportion,
          id,
        ]
      );
      if (result == 23505) {
        res.send("Payment method already exists");
      } else {
        res.send(result);
      }
    }
  }
});

router.post("/addcart", verifyToken, async (req, res) => {
  const id = req.query.productid;
  const userid = await currentUser(req);
  if (!id) {
    res.send("Please provider an ID");
  } else {
    const check = await db.query("SELECT * from products WHERE id = $1 and deleted_at IS NULL", [id]);

    if (check.rows.length == 0) {
      res.send("Invalid ID");
    } else {
      const check_stock = await db.query(
        "SELECT amount from stock where product_id = $1 and deleted_at IS NULL",
        [id]
      );
      if (check_stock.rows[0].amount <= 0) {
        res.send("Out of stock");
      } else {
        const price = await db.query(
          "SELECT price from products WHERE id = $1 and deleted_at IS NULL",
          [id]
        );
        await addtocart.addtocart(userid, id, price.rows[0].price);
        await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
          check_stock.rows[0].amount - 1,
          id,
        ]);
        res.send("Added to cart");
      }
    }
  }
});

router.get("/cart", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  if (userid) {
    try {
      const usercart = await fs.readFile(`./cart/cart${userid}.json`);
      res.setHeader("Content-Type", "application/json");
      res.send(usercart);
    } catch (err) {
      if (err.errno == "-4058") {
        res.send("Empty Cart");
      } else {
        console.log(err);
        res.send(err);
      }
    }
  } else {
    res.send("ID not found");
  }
});

router.get("/list", verifyTokenAdmin, async (req, res) => {
  const id = req.body.id;
  const groupid = req.body.groupid;
  const name = req.body.name;
  const price = req.body.price;
  const date = req.body.date;
  if (id) {
    const result = await db.query("SELECT * from products WHERE id = $1 and deleted_at IS NULL", [id]);
    res.send(result.rows);
  } else if (groupid) {
    const result = await db.query(
      "SELECT * from products WHERE group_id = $1 and deleted_at IS NULL",
      [groupid]
    );
    res.send(result.rows);
  } else if (name) {
    const result = await db.query("SELECT * from products WHERE name = $1 and deleted_at IS NULL", [
      name,
    ]);
    res.send(result.rows);
  } else if (price) {
    const result = await db.query("SELECT * from products WHERE price = $1 and deleted_at IS NULL", [
      price,
    ]);
    res.send(result.rows);
  } else if (date) {
    const result = await db.query(
      "SELECT * from products WHERE add_date = $1 and deleted_at IS NULL",
      [date]
    );
    res.send(result.rows);
  } else {
    res.send("Invalid parameter");
  }
});

router.post("/addcoupon", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  const coupon = req.query.coupon;
  const check = await db.query(
    "SELECT code, discount, type_discount from promotional_codes WHERE code = $1 and deleted_at IS NULL",
    [coupon]
  );
  if (fs2.existsSync(`./coupons/user${userid}.json`) == true) {
    res.send("You already have a coupon");
  } else if (fs2.existsSync(`./cart/cart${userid}.json`) == false) {
    res.send("You have to add a product to cart first before add a coupon.");
  } else {
    if (check.rows.length >= 1) {
      const newcode = [
        {
          code: check.rows[0].code,
          discount: parseFloat(check.rows[0].discount),
          type_discount: check.rows[0].type_discount,
        },
      ];
      await fs.writeFile(
        `./coupons/user${userid}.json`,
        JSON.stringify(newcode)
      );

      // update the cart
      try {
        const updatecart = await fs.readFile(`./cart/cart${userid}.json`);
        const updateusercart = JSON.parse(updatecart);

        updateusercart.forEach((element) => {
          element.discount_value = parseFloat(check.rows[0].discount);
          if (check.rows[0].type_discount == "fix") {
            element.unitary_price -= parseFloat(check.rows[0].discount);
            element.total_price = element.unitary_price * element.quantity;
            element.type_discount = "fix";
          } else {
            let percentage =
              (check.rows[0].discount / 100) * element.unitary_price;
            element.unitary_price -= percentage;
            element.total_price = element.unitary_price * element.quantity;
            element.type_discount = "percentage";
          }
        });
        await fs.writeFile(
          `./cart/cart${userid}.json`,
          JSON.stringify(updateusercart)
        );
        res.send("Coupon added and prices updated");
      } catch (err) {
        if (err.errno == "-4058") {
          res.send("Coupon added");
        } else {
          console.log(err);
          res.send(err);
        }
      }
    } else {
      res.send("Invalid coupon");
    }
  }
});

router.get("/coupon", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  try {
    const result = await fs.readFile(`./coupons/user${userid}.json`);
    res.setHeader("Content-Type", "application/json");
    res.send(result);
  } catch (err) {
    if (err.errno == "-4058") {
      res.send("You haven't applied a coupon");
    } else {
      console.log(err);
      res.send(err);
    }
  }
});

router.delete("/coupon", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  try {
    await fs.unlink(`./coupons/user${userid}.json`);
    try {
      const updatecart = await fs.readFile(`./cart/cart${userid}.json`);
      const updateusercart = JSON.parse(updatecart);

      updateusercart.forEach((element) => {
        if (element.type_discount == "fix") {
          element.unitary_price = element.original_value;
          element.total_price = element.unitary_value * element.quantity;
          element.type_discount = "none";
          element.discount_value = 0;
        } else {
          element.unitary_price = element.original_value;
          element.total_price = element.original_value * element.quantity;
          element.type_discount = "none";
          element.discount_value = 0;
        }
      });
      await fs.writeFile(
        `./cart/cart${userid}.json`,
        JSON.stringify(updateusercart)
      );
      res.send("Deleted");
    } catch (err) {
      if (err.errno == "-4058") {
        res.send("test");
      } else {
        console.log(err);
        res.send(err);
      }
    }
  } catch (err) {
    if (err.errno == "-4058") {
      res.send("File doesn't exists");
    } else {
      console.log(err);
      res.send(err);
    }
  }
});

router.post("/buy", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  const method = req.body.method;
  const today = new Date().toLocaleString();
  let todayconverted = new Date(today);
  if (userid && fs2.existsSync(`./cart/cart${userid}.json`)) {
    const requestbuy = await buy.buy(todayconverted, userid, method);
    res.send(requestbuy);
  } else {
    res.send("User ID not found or empty cart");
  }
});

function verifyToken(req, res, next) {
  jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(`${err.name}: ${err.message}`);
      return res.status(401).send("Unauthorized");
    } else {
      next();
    }
  });
}

router.put("/modifycart", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  const id = req.query.id;
  const quantity = req.query.quantity;
  const current_cart = await fs.readFile(`./cart/cart${userid}.json`);
  const jsoncart = JSON.parse(current_cart);
  let currentquantity = 0;

  const cart_object = jsoncart.map((element) => {
    return parseInt(element.product_id);
  });

  const find_product = cart_object.indexOf(parseInt(id));

  if(find_product == -1) {
    res.send("Product not found");
  }

  else {
    const check_stock = await db.query(
      "SELECT amount from stock where product_id = $1",
      [id]
    );
    if (check_stock.rows[0].amount - parseInt(quantity) <= 0) {
      res.send("Out of stock");
    }
    else {
      if(parseInt(quantity) < jsoncart[find_product].quantity) {
        await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [check_stock.rows[0].amount + 1, id]);
      }
      else {
      currentquantity = jsoncart[find_product].quantity;
      jsoncart[find_product].quantity = parseInt(quantity);
      jsoncart[find_product].total_price = parseFloat(jsoncart[find_product].unitary_price) * parseFloat(jsoncart[find_product].quantity).toFixed(2);
      jsoncart[find_product].total_price = +jsoncart[find_product].total_price.toFixed(2);
      
      await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [check_stock.rows[0].amount - (jsoncart[find_product].quantity - currentquantity), id]);
      await fs.writeFile(`./cart/cart${userid}.json`, JSON.stringify(jsoncart));
      res.send("Cart updated");
      }
    }
  }
});

router.delete("/removeproduct", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  const id = req.query.id;

  const current_cart = await fs.readFile(`./cart/cart${userid}.json`);
  const jsoncart = JSON.parse(current_cart);
  const current_stock = await db.query(
    "SELECT amount from stock where product_id = $1",
    [id]
  );

  const cart_object = jsoncart.map((element) => {
    return parseInt(element.product_id);
  });

  const find_product = cart_object.indexOf(parseInt(id));

  if (find_product == -1) {
    res.send("Product not found");
  } else {
    await db.query("UPDATE stock SET amount = $1 WHERE product_id = $2", [
      current_stock.rows[0].amount + jsoncart[find_product].quantity,
      id,
    ]);
    if (jsoncart.length == 1) {
      fs.unlink(`./cart/cart${userid}.json`);
      res.send("Cart deleted");
    } else {
      jsoncart.splice(find_product, 1);
      await fs.writeFile(`./cart/cart${userid}.json`, JSON.stringify(jsoncart));
      res.send("Product removed from cart");
    }
  }
});

router.post("/contact", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const subject = req.body.subject;
  const message = req.body.message;
  const priority = req.body.priority;
  if (!email) {
    res.send("Please fill your email");
  } else if (!name) {
    res.send("Please fill your name");
  } else if (!subject) {
    res.send("Please fill the subject");
  } else if (!message) {
    res.send("Please fill the message");
  } else if (!priority) {
    res.send("Please fill the priority");
  } else {
    try {
      await contact.sendEmail(email, name, subject, message, priority);
      res.send("Message sent");
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
});

router.post("/requestrefund", verifyToken, async (req, res) => {
  const userid = await currentUser(req);
  const saleid = req.query.saleid;
  const reason = req.body.reason;
  const checksaleid = await db.query(
    "SELECT * from sale_header where id = $1 and user_id = $2",
    [saleid, userid]
  );
  if (!saleid) {
    res.send("Please fill the sale id");
  } else if (!reason) {
    res.send("Please fill the reason");
  } else if (checksaleid.rows.length <= 0) {
    res.send("Invalid sale id");
  } else {
    const checkreq = await db.query(
      "SELECT * from req_refunds where sale_header_id = $1",
      [saleid]
    );
    if (checkreq.rows.length >= 1) {
      res.send(
        "You have already made a request for this sale, please wait while we evaluate it"
      );
    } else {
      try {
        await Promise.all([
          refund.sendEmail(userid, reason, saleid),
          db.query(
            "INSERT INTO req_refunds(user_id, reason, sale_header_id) VALUES ($1, $2, $3)",
            [userid, reason, saleid]
          ),
        ]);
        res.send("Your request has sent and will be evaluated");
      } catch (err) {
        console.log(err);
        res.send("Error on sending email");
      }
    }
  }
});

router.post("/refund", verifyTokenAdmin, async (req, res) => {
  const refundid = req.query.refundid;
  const now = new Date().toLocaleString();
  let todayconverted = new Date(now);
  const check = await db.query("SELECT * from req_refunds WHERE id = $1", [refundid]);

  if(check.rows.length >=1) {
    try {
      const username = await db.query(
        "SELECT * from users where (id = $1 AND deleted_at IS NULL)",
        [check.rows[0].user_id]
      );
      const amountrefund = await db.query("SELECT * from sale_header where id = $1", [check.rows[0].sale_header_id])
      console.log(amountrefund.rows);
      todayconverted.setDate(todayconverted.getDate() + 30);
    await Promise.all([
      db.query("UPDATE sale_header SET refunded = $1 WHERE id = $2", [
        true,
        check.rows[0].sale_header_id,
      ]),
      db.query(
        "UPDATE sale_items SET refunded = $1 WHERE sale_header_id = $2",
        [true, check.rows[0].sale_header_id]
      ),
      db.query(
        "UPDATE bills_receive SET refunded = $1, deleted_at = $2 WHERE sale_header_id = $3",
        [true, now, check.rows[0].sale_header_id]
      ),
      db.query(
        "INSERT INTO bills_pay(amount, method_id, deadline, user_id) VALUES($1, $2, $3, $4)",
        [parseFloat(amountrefund.rows[0].total), amountrefund.rows[0].payment_method_id, todayconverted, check.rows[0].user_id]
      ),
      db.query(
        "UPDATE req_refunds SET deleted_at = $1 where id - $2",
        [now, refundid]
      )
    ]);
    await successrefund.sendEmail(username.rows[0].email, username.rows[0].first_name, check.rows[0].sale_header_id);
    res.send("Successfully refunded");
  } catch (err) {
    console.log(err);
    res.send("Error, contact the support");
  }
    
  }
})

function verifyTokenAdmin(req, res, next) {
  jwt.verify(req.cookies.usertoken, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(`${err.name}: ${err.message}`);
      return res.status(401).send("Unauthorized");
    } else {
      if (decoded.roleID != 1) {
        return res.status(401).send("Unauthorized");
      } else {
        next();
      }
    }
  });
}

module.exports = router;
