const path = require('path');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  debug: true,
});

const mail = (email, patientId) => {
  const mailOptions = {
    from: 'qkumlab@gmail.com',
    to: email,
    subject: 'Your PCR Test result',
    attachments: [
      {
        filename: `${patientId}.pdf`,
        path: path.join(__dirname, `../../PCR_TESTS/${patientId}.pdf`),
        contentType: 'application/pdf',
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      // return err;
    } else {
      console.log(info);
      // return info;
    }
  });
};

mail('kridiramilli@gmail.com', 'ca2ba792-844a-4767-a501-92d239541643');

module.exports = {
  mail,
};
