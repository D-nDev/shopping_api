require("dotenv").config();
const totalvoice = require("totalvoice-node");
const client = new totalvoice(process.env.SMS_KEY); // your key from totalvoice

function sendSms(usernumber, token) {
  return new Promise((resolve, reject) => {
    const user_response = false;
    const multi_sms = true;
    const create_date = "";
    const message =
      "Here is your code to AlphaShop:" +
      "\n" +
      token +
      "                                    " +
      "Use your code at: " +
      "/recover"; // sms message
    client.sms
      .enviar(
        usernumber,
        message.replace(/\|/g, "\n"),
        user_response,
        multi_sms,
        create_date
      )
      .then((data) => {
        console.log(data);
        resolve("1");
      })
      .catch((error) => {
        console.error("Error: ", error);
        reject(error.data.mensagem);
      });
  });
}

module.exports = {
  sendSms,
};
