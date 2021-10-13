const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

require('./db');
require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(staticDir));

app.get('/', (req, res) => {
  res.sendFile(`${staticDir}/index.html`);
});

app.get('/me:id', (req, res) => {
  res.send('Me');
});

app.post('/generate', (req, res) => {
  const { patient } = req.body;
  if (patient) {
    fs.mkdir(
      `PDF_TESTS/${patient}_${Date.now()}`,
      { recursive: true },
      (err) => {
        console.error(err);
      }
    );
    res.status(200).send('created');
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
