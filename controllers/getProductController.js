require("dotenv").config();
const db = require("@model/db");

module.exports = {
  get: async (req, res) => {
    const id = req.body.id;
    const groupid = req.body.groupid;
    const name = req.body.name;
    const price = req.body.price;
    const date = req.body.date;
    if (id) {
      if (id == 0) {
        const result = await db.query(
          "SELECT * from products WHERE deleted_at IS NULL"
        );
        res.send(result.rows);
      } else {
        const result = await db.query(
          "SELECT * from products WHERE id = $1 and deleted_at IS NULL",
          [id]
        );
        res.send(result.rows);
      }
    } else if (groupid) {
      const result = await db.query(
        "SELECT * from products WHERE group_id = $1 and deleted_at IS NULL",
        [groupid]
      );
      res.send(result.rows);
    } else if (name) {
      const result = await db.query(
        "SELECT * from products WHERE name = $1 and deleted_at IS NULL",
        [name]
      );
      res.send(result.rows);
    } else if (price) {
      const result = await db.query(
        "SELECT * from products WHERE price = $1 and deleted_at IS NULL",
        [price]
      );
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
  },
};
