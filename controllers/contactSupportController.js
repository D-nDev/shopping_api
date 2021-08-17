const contact = require("@functions/SendContactEmail");

module.exports = {
  post: async (req, res) => {
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
  },
};
