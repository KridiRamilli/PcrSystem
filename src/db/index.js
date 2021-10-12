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

db.close();
