

require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSID = process.env.TWILIO_SERVICES_ID;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  makeOtp: (phoneNumber) => {
    console.log(phoneNumber);
    return new Promise((resolve, reject) => {
      console.log('veri');
      client.verify.v2
        .services(serviceSID)
        .verifications.create({
          to: `+91${phoneNumber}`,
          channel: "sms",

        })
        .then((response) => {
          console.log(response.status);
          resolve(response);
        })
        .catch((err) => {
          console.log("it is error" + err);
          reject(err)
        });
    });
  },
  varifyOtp: (phoneNumber, otp) => {
    console.log(phoneNumber);
    console.log(otp);
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${phoneNumber}`, code: otp.otp })
        .then((verified) => {
          console.log(verified);
          resolve(verified);
        }).catch((err) => {
          console.log('virification Error' + err);
          reject(err)
        })
    })
  },
};
