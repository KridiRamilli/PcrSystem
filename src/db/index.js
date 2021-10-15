const sqlite3 = require('sqlite3').verbose();

let db = null;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('src/db/main.db', (err) => {
      if (err) {
        return reject(err);
      }
    });
    db.run(
      `CREATE TABLE IF NOT EXISTS patients (
        patient_id INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        reference INTEGER NOT NULL,
        sex TEXT NOT NULL,
        age TEXT NOT NULL,
        personal_id TEXT NOT NULL PRIMARY KEY,
        accepted TEXT NOT NULL,
        approved TEXT NOT NULL,
        result TEXT NOT NULL,
        application_time TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      }
    );
  });
};
const addPatient = (patientData) => {
  // const {
  //   patientId,
  //   patientName,
  //   sexAge,
  //   personalId,
  //   accepted,
  //   approved,
  //   result,
  //   applicationTime
  // } = patientData;
  // console.log(db.__proto__);
  const query =
    'INSERT INTO patient VALUES (115425645,"kridi",4,"M","14578777O","29/09/2021  13:34","29/09/2021  13:34","NEGATIVE","29/09/2021  13:34")';
  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      return resolve();
    });
  });
};

const getPatient = (personalId) => {
  let query = `SELECT * FROM patients WHERE personal_id="${personalId}"`;
  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      console.log('from me', row);
      console.log('from me', query);
      resolve(row);
    });
  });
};

const getAllData = () => {
  db.all('SELECT personal_id AS id, result FROM patient', (err, rows) => {
    if (err) {
      console.error(err);
    }
    console.log(rows);
  });
};

// const createPatient = async (patientData) => {
//   const query = `INSERT INTO patient VALUES (${})`;
// };

// db.close();

module.exports = {
  init,
  addPatient,
  getAllData,
  getPatient,
};
