const templatecontact = require("../templates/contact.js");
const nodemailer = require("nodemailer");

function sendEmail(email, name, subject, message, priority) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      name: "smtp.gmail.com",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL, // your email in .env(recommended gmail)
        pass: process.env.EMAIL_PASS, // your password in .env
      },
      logger: true,
      debug: true,
    });
    const mailOptions = {
      to: `diego-s.novaes@hotmail.com`,
      subject: `Contact from ${name + " - " + email}`,
      html: templatecontact.contactemail(email, name, subject, message, priority)
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(true); // send back to the app.js, in order to send something to the front-end or whatever else
      }
    });
  });
}

module.exports = {
  sendEmail,
};
