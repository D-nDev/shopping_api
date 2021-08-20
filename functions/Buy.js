const fs = require("fs").promises;
const fs2 = require("fs");
const db = require("@model/db");
const insertcart = require("@functions/InsertSaleItems");

async function userhascoupon(userid, total, searchmethod, today, cart) {
  const coupon = await fs.readFile(`././coupons/user${userid}.json`);
  const usercoupon = JSON.parse(coupon);
  let getcoupon = usercoupon[0].code;

  try {
    const codeid = await db.query(
      "SELECT id from promotional_codes WHERE code = $1",
      [getcoupon]
    );
    await db.query("BEGIN TRANSACTION");

    const postsaleheader = await db.query(
      "INSERT INTO sale_header(user_id, promotional_code_id, total, payment_method_id, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userid, codeid.rows[0].id, total, searchmethod.id, today]
    );
    if(postsaleheader.severity) {
      await db.query("ROLLBACK");
      return "Error on insert header";
    }
    
    const postbills = await db.query(
      "INSERT INTO bills_receive(user_id, sale_header_id, amount, method_id, deadline) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [userid, postsaleheader.rows[0].id, total, searchmethod.id, today]
    );
    if(postbills.severity) {
      await db.query("ROLLBACK");
      return "Error on insert bills receive";
    }
    
    const usercart = await insertcart.insertitems(postsaleheader.rows[0].id, cart);
    if(usercart >= 1) {
      await db.query("ROLLBACK");
      return "Error on add an sale item";
    }
    
    await db.query("COMMIT");

    await fs.unlink(`././coupons/user${userid}.json`);
    await fs.unlink(`././cart/cart${userid}.json`);
    return "Payment successfully";
  } catch (err) {
    console.log(err);
    return "Error, please contact the administrator";
  }
}

async function userhasnocoupon(userid, total, searchmethod, today, cart) {
  try {
    await db.query("BEGIN TRANSACTION");

    const postsaleheader = await db.query(
      "INSERT INTO sale_header(user_id, total, payment_method_id, deadline) VALUES ($1, $2, $3, $4) RETURNING *",
      [userid, total, searchmethod.id, today]
    );
    if(postsaleheader.severity) {
      await db.query("ROLLBACK");
      return "Error on insert header";
    }

    const postbills = await db.query(
      "INSERT INTO bills_receive(user_id, sale_header_id, amount, method_id, deadline) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [userid, postsaleheader.rows[0].id, total, searchmethod.id, today]
    );
    if(postbills.severity) {
      await db.query("ROLLBACK");
      return "Error on insert bills receive";
    }
    
    const usercart = await insertcart.insertitems(postsaleheader.rows[0].id, cart);
    if(usercart >= 1) {
      await db.query("ROLLBACK");
      return "Error on add an sale item";
    }

    await db.query("COMMIT");
    await fs.unlink(`././cart/cart${userid}.json`);
    return "Payment successfully";
  } catch (err) {
    console.log(err);
    return "Error, please contact the administrator";
  }
}

async function buy(today, userid, method) {
  let total = 0;

  const allowmethods = await db.query(
    "SELECT name, id, daystopay from payment_method"
  );

  const searchmethod = allowmethods.rows.find((o) => o.name === method);
  if (searchmethod != undefined) {
    const usercart = await fs.readFile(`././cart/cart${userid}.json`);
    const hascoupon = fs2.existsSync(`././coupons/user${userid}.json`);
    if (usercart.length >= 1) {
      const cart = JSON.parse(usercart);
      cart.forEach((element) => {
        total += element.total_price;
      });
      today.setDate(today.getDate() + searchmethod.daystopay);

      if (hascoupon) {
        const coupon = await userhascoupon(
          userid,
          total,
          searchmethod,
          today,
          cart
        );
        return coupon;
      } else {
        const nocoupon = await userhasnocoupon(
          userid,
          total,
          searchmethod,
          today,
          cart
        );
        return nocoupon;
      }
    } else {
      return "Empty cart";
    }
  } else {
    return "Invalid payment method";
  }
}

module.exports = { buy };
