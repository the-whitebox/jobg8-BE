const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");

const sendEmail = async (email, subject, userName, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };
    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      template: "email",
      context: {
        name: userName,
        newPassword: password,
      },
    });
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
