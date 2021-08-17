require("dotenv").config();
const db = require("@model/db");
const successrefund = require("@functions/SendRefundSuccessEmail");

module.exports = {
  post: async (req, res) => {
    const refundid = req.query.refundid;
    const now = new Date().toLocaleString();
    let todayconverted = new Date(now);
    const check = await db.query("SELECT * from req_refunds WHERE id = $1", [
      refundid,
    ]);

    if (check.rows.length >= 1) {
      try {
        const username = await db.query(
          "SELECT * from users where (id = $1 AND deleted_at IS NULL)",
          [check.rows[0].user_id]
        );
        const amountrefund = await db.query(
          "SELECT * from sale_header where id = $1",
          [check.rows[0].sale_header_id]
        );
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
            [
              parseFloat(amountrefund.rows[0].total),
              amountrefund.rows[0].payment_method_id,
              todayconverted,
              check.rows[0].user_id,
            ]
          ),
          db.query("UPDATE req_refunds SET deleted_at = $1 where id = $2", [
            now,
            refundid,
          ]),
        ]);
        await successrefund.sendEmail(
          username.rows[0].email,
          username.rows[0].first_name,
          check.rows[0].sale_header_id
        );
        res.status(200).send("Successfully refunded");
      } catch (err) {
        console.log(err);
        res.status(500).send("Error, contact the support");
      }
    }
    else {
      res.status(404).send("Refund Order not found");
    }
  },
};
