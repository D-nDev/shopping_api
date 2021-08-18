require("dotenv").config();
const db = require("@model/db");
const currentUserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  get: async (req, res) => {
    const userid = await currentUserID(req);
    const saleheaderid = req.query.saleheaderid;
    try {
      if (!saleheaderid) {
        const result = await db.query(
          "SELECT * from sale_header where user_id = $1 and deleted_at IS NULL",
          [userid]
        );
        if (result.rows.length <= 0) {
          res.status(404).send("No sale headers found");
        } else {
          res.status(200).send(result.rows);
        }
      } else {
        const result = await db.query(
          "SELECT * from sale_header where user_id = $1 and id = $2 and deleted_at IS NULL",
          [userid, saleheaderid]
        );
        if (result.rows.length <= 0) {
          res.status(404).send("No sale header with this ID found");
        } else {
          res.status(200).send(result.rows);
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error, please contact administrator");
    }
  },
};
