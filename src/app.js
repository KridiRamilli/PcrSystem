const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const multer = require('multer');

const db = require('./db');
const mail = require('./mail');
const exportData = require('./exportData');

const { getAge, calcDate, generatePDF, logger } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(staticDir));

const upload = multer();

app.get('/', (req, res) => {
  res.sendFile(`${staticDir}/index.html`);
});

app.get('/me/:id', (req, res) => {
  const { id } = req.params;
  let filePath = path.join(__dirname, '..', 'pcr_tests', `${id}.pdf`);
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    return fileStream.pipe(res);
  }

  //TODO ADD HTML PAGE OF NOT FOUND
  res.status(401).send('File not found');
});

app.get('/stats', async (req, res) => {
  const result = await db.getPatientResult();
  res.status(200).send(result);
});

app.post('/export', async (req, res) => {
  const { filter } = req.body;
  let filePath = await exportData.generateExcel(filter);
  const fileStream = fs.createReadStream(filePath);
  //TODO refactor so file is not corrupt
  // res.setHeader('Content-Type', 'application/vnd.ms-excel');
  // res.setHeader('Content-disposition', 'attachment;filename=myExcel.xls');
  return fileStream.pipe(res);
});

app.post('/search', async (req, res) => {
  const { personalId } = req.body;
  if (personalId === 'ALL') {
    let zipPath = await exportData.pdfToZip();
    const fileStream = fs.createReadStream(zipPath);
    return fileStream.pipe(res);
  }
  const patient = await db.getPatient(personalId);
  if (!patient) {
    res.status(400).send({ msg: 'Error: Patient not found!' });
  }
  res.status(201).send(patient);
});

app.post('/generate', async (req, res) => {
  const { name, lname, sex, birthday, result, personalId, email } = req.body;
  if (Object.values(req.body).filter(Boolean).length < 7) {
    return res.status(401).send({ msg: 'Error: Missing patient data!' });
  }
  let id = uuidv4();
  let patientName = `${name} ${lname}`;
  let qrcodeUrl = `http://127.0.0.1:3000/me/${id}`;
  let pdfPath = path.join(__dirname, '..', 'pcr_tests');
  const { age, born } = getAge(birthday);
  const { approved, accepted } = calcDate();
  const reference = await db.getReference();
  const newPatient = {
    patientId: id,
    patientName,
    qrcodeUrl,
    pdfPath,
    result,
    reference: reference || 1,
    personalId,
    path,
    sex,
    age,
    born,
    approved,
    accepted,
    applicationTime: approved,
    email,
  };
  db.addPatient(newPatient).catch((err) => {
    logger.error(err);
    res.status(401).send({ msg: 'Error: Patient not inserted in DB!' });
    return;
  });
  generatePDF(newPatient).catch((err) => {
    logger.error(err);
    res.status(401).send({ msg: 'Error: PDF not generated!' });
  });
  res.status(200).send({ patientName, qrcodeUrl });
});

app.post('/uploadFile', upload.single('file'), async (req, res) => {
  const fileBuffer = req.file.buffer;
  try {
    await exportData.excelToDb(fileBuffer);
    res.status(200).send({ msg: 'Records inserted in DB!' });
  } catch (error) {
    logger.error(error);
    res.status(401).send({ msg: 'Error: File not uploaded!' });
  }
});

//#region DB INIT
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
//#endregion
const closeDb = () => {
  db.closeDb()
    .then((res) => logger.info(res))
    .catch((err) => logger.error(err));
};

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down....');
  logger.error(err);
  process.exit(1);
});

process.on('SIGINT', closeDb);
process.on('SIGTERM', closeDb);
process.on('SIGUSR2', closeDb);
