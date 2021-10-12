const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const pcrTemplate = fs.readFileSync('./assets/PCR_Template.pdf');
const qrcodeImg = fs.readFileSync('./assets/qrcode.png');
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

const generatePDF = async () => {
  const pdfDoc = await PDFDocument.load(pcrTemplate);
  const qrImg = await pdfDoc.embedPng(qrcodeImg);
  // const pages = pdfDoc.getPages();
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

generatePDF();
