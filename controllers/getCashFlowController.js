const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    try {
      const flow = await db.query("SELECT * from vw_cashflow");
      res.status(200).send(flow.rows);
    } catch (err) {
      console.log(err);
      res.status(500).send("Error, please contact the administrator");
    }
  },
};
