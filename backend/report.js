// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// MySQL connection (local to VM)
const db = mysql.createConnection({
  host: "20.2.209.23", //Server IP address
  user: "syahmie", //username
  password: "1234", // password
  database: "lhdn", //database name
});


app.get('/api/taxdata', (req, res) => {
  db.query("SELECT * FROM TAX_PAYMENT", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/api/userdata', (req, res) => {
  db.query("SELECT * FROM USERS", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3002, () => {
  console.log("API running on port 3002");
});
