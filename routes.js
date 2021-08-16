// test refactor branch
process.env.TZ = "America/Sao_Paulo";
require("dotenv").config();
require('module-alias/register');
const express = require("express");
const fs = require("fs").promises;
const fs2 = require("fs");
const jwt = require("jsonwebtoken");
const cookie_parser = require("cookie-parser");
const db = require("./model/db");
const loginController = require("@controller/loginController");
const registerController = require("@controller/registerController");
const forgotpassemailController = require("@controller/forgotPassEmailController");
const forgotpasssmsController = require("@controller/forgotPassSMSController");
const resetpassController = require("@controller/resetPassController");
const addnewproductController = require("@controller/addNewProductController");
const addnewproductgroupController = require("@controller/addNewProductGroupController");
const addnewproviderController = require("@controller/addNewProviderController");
const addnewpromotionalcodeController = require("@controller/addNewPromotionalCodeController");
const addnewpaymentmethodController = require("@controller/addNewPaymentMethodController");
const deleteproductController = require("@controller/deleteProductController");
const deleteproductgroupController = require("@controller/deleteProductGroupController");
const deleteproviderController = require("@controller/deleteProviderController");
const deletepromotionalcodeController = require("@controller/deletePromotionalCodeController");
const deletepaymentmethodController = require("@controller/deletePaymentMethodController");
const deleteaccountController = require("@controller/deleteAccountController");
const getproductController = require("@controller/getProductController");
const getproductgroupController = require("@controller/getProductGroupController");
const getproviderController = require("@controller/getProviderController");
const getpromotionalcodeController = require("@controller/getPromotionalCodeController");
const getpaymentmethodController = require("@controller/getPaymentMethodController");
const contact = require("./controllers/sendcontactmail");
const refund = require("./controllers/sendrefundmail");
const successrefund = require("./controllers/sendrefundsuccessmail");
const addtocart = require("./controllers/addtocart");
const buy = require("./controllers/buy");
const verifyToken = require("@middlewares/userToken").verifyToken;
const verifyTokenAdmin = require("@middlewares/adminToken").verifyTokenAdmin;
const currentuserID = require("@functions/CurrentUserID").currentUser;
const app = express();

const router = express.Router();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookie_parser("1234"));

router.post("/login", loginController.post);
router.post("/logout", (req, res) => {
  res.status(202).clearCookie("usertoken").send("cookies cleared");
});
router.post("/register", registerController.post);
router.post("/requestpass_email", forgotpassemailController.post);
router.post("/requestpass_sms", forgotpasssmsController.post);
router.post("/resetpass", resetpassController.post);
router.post("/addproduct", verifyTokenAdmin, addnewproductController.post);
router.post("/addgroup", verifyTokenAdmin, addnewproductgroupController.post);
router.post("/addprovider", verifyTokenAdmin, addnewproviderController.post);
router.post("/addcode", verifyTokenAdmin, addnewpromotionalcodeController.post);
router.post("/addpaymentmethod", verifyTokenAdmin, addnewpaymentmethodController.post);
router.delete("/deleteproduct", verifyTokenAdmin, deleteproductController.delete);
router.delete("/deletegroup", verifyTokenAdmin, deleteproductgroupController.delete);
router.delete("/deleteprovider", verifyTokenAdmin, deleteproviderController.delete);
router.delete("/deletecode", verifyTokenAdmin, deletepromotionalcodeController.delete);
router.delete("/deletepaymentmethod", verifyTokenAdmin, deletepaymentmethodController.delete);
router.delete("/deleteaccount", verifyTokenAdmin, deleteaccountController.delete);
router.get("/product", getproductController.get);
router.get("/group", getproductgroupController.get);
router.get("/provider", verifyTokenAdmin, getproviderController.get);
router.get("/code", verifyTokenAdmin, getpromotionalcodeController.get);
router.get("/paymentmethod", verifyTokenAdmin, getpaymentmethodController.get);

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

module.exports = router;
