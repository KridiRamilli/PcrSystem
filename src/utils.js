const { PDFDocument, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const { DateTime } = require('luxon');
const fs = require('fs');

// TODO
const pcrTemplate = fs.readFileSync('./assets/PCR_Template.pdf');
// const qrcodeImg = fs.readFileSync('./assets/qrcode.png'); //remove
const isBold = ['Pacienti', 'Rezultati', 'Aprovuar'];

const db = {
  Pacienti: 'KRIDI RAMILLI',
  Referenca: '547789',
  SexAge: 'Mashkull-32',
  ID: 'I4769647O',
  Pranuar: '29/09/2021  13:34',
  Aprovuar: '29/09/2021  13:34',
  Origjina: '',
  Rezultati: 'POZITIVE',
  OraAplikimit: '29/09/21 16:56',
};

const generateQRCODE = async (text) => {
  try {
    const qrcode = await QRCode.toDataURL(text);
    return qrcode;
  } catch (err) {
    console.error(err);
  }
  return false;
};

const formatDate = () => {
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

const generatePDF = async () => {
  const pdfDoc = await PDFDocument.load(pcrTemplate);
  const qrcode = await generateQRCODE('Kridi');
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
      textField.setText(db[name]);
      textField.defaultUpdateAppearances(helvetica);
    } else {
      const textField = form.getTextField(name);
      textField.setFontSize(9);
      textField.setText(db[name]);
    }
  });
  form.flatten();
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('./test.pdf', pdfBytes);
};
// generatePDF();

// console.log(getAge('2000-10-22'));

// formatDate();
module.exports = {
  generatePDF,
};
