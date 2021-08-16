require("dotenv").config();
const db = require("@model/db");
const currentuserID = require("@functions/CurrentUserID").currentUser;

module.exports = {
  delete: async (req, res) => {
    const now = new Date().toLocaleString();
    const id = req.query.id;
    try {
      const currentuser = await currentuserID(req);
      const check = await db.query(
        "SELECT id from users WHERE id = $1 and deleted_at IS NULL",
        [id]
      );

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
      console.log(err);
      res.send(err);
    }
  },
};
