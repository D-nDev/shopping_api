const contact = require("@functions/SendContactEmail");

module.exports = {
  post: async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const subject = req.body.subject;
    const message = req.body.message;
    const priority = req.body.priority;
    if (!email) {
      res.status(400).send("Please fill your email");
    } else if (!name) {
      res.status(400).send("Please fill your name");
    } else if (!subject) {
      res.status(400).send("Please fill the subject");
    } else if (!message) {
      res.status(400).send("Please fill the message");
    } else if (!priority) {
      res.status(400).send("Please fill the priority");
    } else {
      try {
        await contact.sendEmail(email, name, subject, message, priority);
        res.status(201).send("Message sent");
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
    }
  },
};
