const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL, // generated ethereal user
        pass: process.env.SMTP_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
      to: options.email,
      subject: options.subject, // Subject line
      text: options.message, // plain text body
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
