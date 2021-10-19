const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const { DateTime } = require('luxon');

const db = require('./db');
const { mail } = require('./mail');

// TODO remove sync reading
const pcrTemplate = fs.readFileSync(
  __dirname + '/public/assets/PCR_Template.pdf'
);
const isBold = ['patient_name', 'result', 'approved'];

const generateQRCODE = async (text) => {
  try {
    const qrcode = await QRCode.toDataURL(text);
    return qrcode;
  } catch (err) {
    console.error(err);
  }
  return false;
};

const calcDate = () => {
  const dt = DateTime.now();
  const accepted = dt.toFormat('dd/LL/yyyy HH:mm').toString();
  const approved = dt
    .plus({
      hours: 5,
    })
    .toFormat('dd/LL/yyyy HH:mm')
    .toString();

  return {
    accepted,
    approved,
  };
};

const getAge = (date) => {
  const bornDate = DateTime.fromFormat(date, 'yyyy-LL-dd');
  const age = DateTime.now().diff(bornDate, 'years').years;
  return {
    age: Math.floor(age),
    born: bornDate.toFormat('dd/LL/yyyy').toString(),
  };
};

const generatePDF = async (patientData) => {
  const {
    patientId,
    qrcodeUrl,
    pdfPath,
    personalId,
    born,
    sex,
    age,
    email,
    patientName,
  } = patientData;

  const patientFromDb = await db.getPatient(personalId);
  patientFromDb['sex_age'] = `${sex} / ${born}-${age} vjec`;
  const pdfDoc = await PDFDocument.load(pcrTemplate);
  const qrcode = await generateQRCODE(qrcodeUrl);
  const qrImg = await pdfDoc.embedPng(qrcode);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const helvetica = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  fields.forEach((field) => {
    const name = field.getName();
    if (name === 'qrcode') {
      const textField = form.getTextField(name);
      textField.setImage(qrImg);
    } else if (isBold.includes(name)) {
      const textField = form.getTextField(name);
      textField.setFontSize(11);
      textField.setText(patientFromDb[name]);
      textField.defaultUpdateAppearances(helvetica);
    } else {
      const textField = form.getTextField(name);
      textField.setFontSize(9);
      textField.setText(patientFromDb[name] + '');
    }
  });
  form.flatten();
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(pdfPath, `${patientId}.pdf`), pdfBytes);
  mail(email, patientId, patientName);
};

module.exports = {
  generatePDF,
  getAge,
  calcDate,
};
