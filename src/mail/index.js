const path = require('path');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const mail = (email, patientId, patientName) => {
  let fileName = patientName.split(' ').join('_');
  const mailOptions = {
    from: 'qkumlab@gmail.com',
    to: email,
    subject: 'Your PCR Test result',
    attachments: [
      {
        filename: `${fileName}.pdf`,
        path: path.join(__dirname, `../../pcr_tests/${patientId}.pdf`),
        contentType: 'application/pdf',
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = {
  mail,
};
