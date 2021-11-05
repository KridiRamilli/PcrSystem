const path = require('path');
const fs = require('fs');

const ExcelJS = require('exceljs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const db = require('../db');

const generateExcel = async (filter) => {
  const workbook = new ExcelJS.Workbook();
  const date = new Date(Date.now());
  let filePath = path.join(
    __dirname,
    `../../exports/patientData_${date.toDateString()}.xlsx`
  );
  workbook.creator = 'QKUM LAB';
  workbook.lastModifiedBy = 'Lab';
  workbook.created = date;
  const worksheet = workbook.addWorksheet('Patient Data');
  let rows = null;
  const wideColumns = [
    'patient_id',
    'accepted',
    'approved',
    'application_time',
    'email',
  ];
  worksheet.columns = [
    { header: 'PatienId', key: 'patient_id' },
    { header: 'PatientName', key: 'patient_name' },
    { header: 'Reference', key: 'reference' },
    { header: 'Sex', key: 'sex' },
    { header: 'Birthday', key: 'birthday' },
    { header: 'PersonalId', key: 'personal_id' },
    { header: 'Accepted', key: 'accepted' },
    { header: 'Approved', key: 'approved' },
    { header: 'Result', key: 'result' },
    { header: 'ApplicationTime', key: 'application_time' },
    { header: 'Email', key: 'email' },
  ];
  switch (filter) {
    case 'negative':
      rows = await db.getNegative();
      break;
    case 'positive':
      rows = await db.getPositive();
      break;
    default:
      rows = await db.getAllData();
  }
  worksheet.columns.forEach((column) => {
    column.width = wideColumns.includes(column.key)
      ? 25
      : column.header.length + 5;
  });
  worksheet.addRows(rows);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

//TODO reference should be unique
const excelToDb = async (fileBuffer) => {
  const workbook = new ExcelJS.Workbook();
  const rows = [];
  let reference = await db.getReference();
  await workbook.xlsx.load(fileBuffer);
  const worksheet = workbook.getWorksheet(1);
  worksheet.eachRow((row) => {
    let { values } = row;
    values[0] = uuidv4();
    values.splice(2, 0, reference++);
    rows.push(values);
  });

  //slice(1) to remove double headers
  await db.addDataFromFile(rows.slice(1));
  return true;
};

const pdfToZip = () => {
  return new Promise((resolve, reject) => {
    let filePath = path.join(__dirname, '/pcrTests.zip');
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', {
      zlib: {
        level: 9,
      },
    });
    archive.pipe(output);
    archive.on('error', (err) => {
      reject(err);
    });
    archive.on('end', () => {
      resolve(filePath);
    });
    archive.directory(path.join(__dirname, `../../pcr_tests`), 'PCR_TESTS');
    archive.finalize();
  });
};

module.exports = {
  generateExcel,
  excelToDb,
  pdfToZip,
};
