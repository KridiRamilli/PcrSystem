const ExcelJS = require('exceljs');
const path = require('path');

const db = require('../db');

const generateExcel = async (filter) => {
  const workbook = new ExcelJS.Workbook();
  const date = new Date(Date.now());
  let filePath = path.join(
    __dirname,
    `../../EXPORTS/patientData_${date.toDateString()}.xlsx`
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
    { header: 'Age', key: 'age' },
    { header: 'PersonalId', key: 'personal_id' },
    { header: 'Accepted', key: 'accepted' },
    { header: 'Approved', key: 'approved' },
    { header: 'Result', key: 'result' },
    { header: 'ApplicationTime', key: 'application_time' },
    { header: 'Email', key: 'email' },
  ];
  switch (filter) {
    case 'all':
      rows = await db.getAllData();
      break;
    case 'negative':
      rows = await db.getNegative();
      break;
    case 'positive':
      rows = await db.getPositive();
      break;
    default:
      console.log('Filter not known');
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

const excelToDb = async () => {};

module.exports = {
  generateExcel,
  excelToDb,
};
