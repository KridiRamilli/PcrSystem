const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('src/db/main.db');
db.serialize(() => {
  // db.run('CREATE TABLE lorem (info TEXT)');

  // const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
  // for (let i = 0; i < 100000; i += 1) {
  //   stmt.run(`Ipsum ${i}`);
  // }
  // stmt.finalize();

  db.all('SELECT rowid AS id, info FROM lorem', (err, rows) => {
    // console.log(`${row.id}: ${row.info}`);
    // console.log(rows.length);
  });
});

const init = async () => {
  await db.run(`CREATE TABLE IF NOT EXISTS patient (
    patient_id INTEGER PRIMARY KEY,
    patient_name TEXT NOT NULL,
    reference INTEGER NOT NULL,
    sex_age TEXT NOT NULL,
    personal_id TEXT NOT NULL,
    accepted TEXT NOT NULL,
    approved TEXT NOT NULL,
    result TEXT NOT NULL,
    application_time TEXT NOT NULL
  )`);
  // await db.run(
  //   'INSERT INTO patient VALUES (1222,"kridi",4,"M","14578777O","29/09/2021  13:34","29/09/2021  13:34","NEGATIVE","29/09/2021  13:34")'
  // );
  // await db.all('SELECT patient_id AS id, result FROM patient', (err, rows) => {
  //   if (err) {
  //     console.error(err);
  //   }
  //   console.log(rows);
  // });
  const id = await db.run('SELECT reference FROM patient');
  console.log(id);
};

const createPatient = async (patientData) => {
  const query = 'INSERT INTO patient VALUES ($)';
};

init();

// db.close();
