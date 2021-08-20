module.exports = {
  post: (req, res) => {
    res.status(202).clearCookie("usertoken").send("Cookies cleared and logged-out");
  },
};
