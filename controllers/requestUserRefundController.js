require("dotenv").config();
const currentUserID = require("@functions/CurrentUserID").currentUser;
const db = require("@model/db");
const refund = require("@functions/SendRefundEmail");

module.exports = {
  post: async (req, res) => {
    const userid = await currentUserID(req);
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
  },
};
