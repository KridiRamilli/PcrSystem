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

//Sapo te instalohen paketat djathtas ke live share dhe kliko chat

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
  const reference = await db.getReference();
  console.log('ref val:', reference);
  const newPatient = {
    patientId: id,
    patientName,
    patientUrl,
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
  };
  db.addPatient(newPatient); // do ja jap te gjithe objektin
  res.status(200).send(newPatient);
});

db.init()
  .then(() => {
    // db.addPatient();
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

process.on('SIGINT', db.closeDb);
process.on('SIGTERM', db.closeDb);
process.on('SIGUSR2', db.closeDb);
