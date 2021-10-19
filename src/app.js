const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const db = require('./db');
const mail = require('./mail');

const { getAge, calcDate, generatePDF } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(staticDir));

app.get('/', (req, res) => {
  res.sendFile(`${staticDir}/index.html`);
});

app.get('/me/:id', (req, res) => {
  const { id } = req.params;
  let filePath = path.join(__dirname, '..', 'PCR_TESTS', `${id}.pdf`);
  if (fs.existsSync(filePath)) {
    return res.status(200).sendFile(filePath);
  }
  res.status(401).send('File not found');
});

//TODO
app.get('/stats', async (req, res) => {
  res.send('stats');
});

//TODO
app.get('/all', (req, res) => {
  mail.mail('kridiramilli@gmail.com', 12);
  res.send('all');
});

app.post('/generate', async (req, res) => {
  const { name, lname, sex, birthday, result, personalId, email } = req.body;
  let id = uuidv4();
  let patientName = `${name} ${lname}`;
  let qrcodeUrl = `http://127.0.0.1:3000/me/${id}`;
  let pdfPath = path.join(__dirname, '..', 'PCR_TESTS');
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
    if (err) {
      console.error(err);
      res.status(401).send('User not inserted in DB');
      return;
    }
  });
  generatePDF(newPatient);
  res.status(200).send(qrcodeUrl);
});

//#region DB INIT
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
    db.getPatient('I612889O');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
//#endregion
const closeDb = () => {
  db.closeDb()
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
};

process.on('SIGINT', closeDb);
process.on('SIGTERM', closeDb);
process.on('SIGUSR2', closeDb);
