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
        application_time TEXT NOT NULL,
        email TEXT NOT NULL
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
  const {
    patientId,
    patientName,
    reference,
    sex,
    age,
    personalId,
    accepted,
    approved,
    result,
    applicationTime,
    email,
  } = patientData;

  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO patients VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [
        patientId,
        patientName.toUpperCase(),
        reference + 1,
        sex,
        age,
        personalId.toUpperCase(),
        accepted,
        approved,
        result && result.toUpperCase(),
        applicationTime,
        email,
      ],
      (err) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        return resolve();
      }
    );
  });
};

const getPatient = (personalId) => {
  let query = `SELECT * FROM patients WHERE personal_id="${personalId}"`;
  return new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

const getAllData = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM patients', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};
const getNegative = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM patients WHERE result="NEGATIVE"', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};
const getPositive = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM patients WHERE result="POSITIVE"', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const getReference = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT max(reference) FROM patients', (err, result) => {
      if (err) {
        return reject(err);
      }
      const reference = result['max(reference)'];
      resolve(reference);
    });
  });
};

const addDataFromFile = (rows) => {
  return new Promise((resolve, reject) => {
    let query = db.prepare(
      'INSERT INTO patients VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      (err) => {
        if (err) {
          return reject(err);
        }
        for (let i = 0; i < rows.length; i++) {
          query.run(rows[i]);
        }
        query.finalize();
        resolve();
      }
    );
  });
};

const getPatientResult = async () => {
  const patients = await getAllData();
  let pos = 0;
  let neg = 0;
  for (let i = 0; i < patients.length; i++) {
    if (patients[i].result === 'POSITIVE') {
      pos++;
    } else {
      neg++;
    }
  }
  return { pos, neg };
};

const closeDb = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        return reject(err);
      }
      console.log('Closing DB Connection!');
      resolve(process.exit()); //TODO
    });
  });
};

module.exports = {
  init,
  closeDb,
  addPatient,
  getAllData,
  getNegative,
  getPositive,
  getPatient,
  getReference,
  addDataFromFile,
  getPatientResult,
};
