const fs = require("fs").promises;
const fs2 = require("fs");
const db = require("@model/db");

async function userhascoupon(userid, total, searchmethod, today, cart) {
  const coupon = await fs.readFile(`././coupons/user${userid}.json`);
  const usercoupon = JSON.parse(coupon);
  let getcoupon = usercoupon[0].code;

  const codeid = await db.query(
    "SELECT * from promotional_codes WHERE code = $1",
    [getcoupon]
  );
  const postsaleheader = await db.query(
    "INSERT INTO sale_header(user_id, promotional_code_id, total, payment_method_id, creation_user, update_user, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [userid, codeid.rows[0].id, total, searchmethod.id, userid, userid, today]
  );
  await db.query(
    "INSERT INTO bills_receive(user_id, sale_header_id, amount, method_id, deadline) VALUES($1, $2, $3, $4, $5) RETURNING *",
    [userid, postsaleheader.rows[0].id, total, searchmethod.id, today]
  );

  cart.forEach(async (element) => {
    await db.query(
      "INSERT INTO sale_items (sale_header_id, line, product_id, delivery_method, sold_amount, unitary_value, discount_value, plus_value, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        postsaleheader.rows[0].id,
        element.quantity,
        element.product_id,
        "Courier",
        element.quantity,
        element.unitary_price,
        element.discount_value,
        element.plus_value,
        element.total_price,
      ]
    );
  });
  await fs.unlink(`././coupons/user${userid}.json`);
  await fs.unlink(`././cart/cart${userid}.json`);
  return "Payment successfully";
}

async function userhasnocoupon(userid, total, searchmethod, today, cart) {
  const postsaleheader = await db.query(
    "INSERT INTO sale_header(user_id, total, payment_method_id, creation_user, update_user, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [userid, total, searchmethod.id, userid, userid, today]
  );
  await db.query(
    "INSERT INTO bills_receive(user_id, sale_header_id, amount, method_id, deadline) VALUES($1, $2, $3, $4, $5) RETURNING *",
    [userid, postsaleheader.rows[0].id, total, searchmethod.id, today]
  );
  cart.forEach(async (element) => {
    await db.query(
      "INSERT INTO sale_items (sale_header_id, line, product_id, delivery_method, sold_amount, unitary_value, discount_value, plus_value, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        postsaleheader.rows[0].id,
        element.quantity,
        element.product_id,
        "Courier",
        element.quantity,
        element.unitary_price,
        element.discount_value,
        element.plus_value,
        element.total_price,
      ]
    );
  });
  await fs.unlink(`././cart/cart${userid}.json`);
  return "Payment successfully";
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
