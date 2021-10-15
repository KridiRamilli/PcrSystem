const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const db = require('./db');

console.log(uuidv4());
const { createDir, getAge, calcDate } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(staticDir));

app.get('/', (req, res) => {
  res.sendFile(`${staticDir}/index.html`);
});

app.get('/me:id', (req, res) => {
  const { id } = req.params;
  res.send(id);
});

app.post('/generate', async (req, res) => {
  const { name, lname, sex, birthday, result, personalId } = req.body;
  let id = uuidv4();
  let patientName = `${name} ${lname}`;
  let patientUrl = `127.0.0.1:3000/me/${id}`;
  let path = await createDir(patientName).catch((err) => {
    console.error(err);
    process.exit(1);
  });
  const { age, born } = getAge(birthday);
  const { approved, accepted } = calcDate();
  const newPatient = {
    patientId: id,
    patientName,
    patientUrl,
    result,
    personalId,
    path,
    age,
    sex,
    born,
    approved,
    accepted,
  };
  res.status(200).send(newPatient);
});

db.init()
  .then(() => {
    // db.addPatient();
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
    // db.getPatient('14578777O');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
