require("dotenv").config();
const templatepass = require("../templates/resetpass");
const nodemailer = require("nodemailer");

function sendEmail(email, token, browser, os, os_version, ip, user_name) {
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
      to: `${email}`,
      subject: "Your reset code to AlphaShop",
      html: templatepass.resetTemplate(
        token,
        user_name,
        browser,
        os,
        os_version,
        ip
      ),
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
