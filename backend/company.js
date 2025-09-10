const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// MySQL connection (local to VM)
const db = mysql.createConnection({
   host: "localhost", // your MySQL host
   user: "root",
   password: "", // your MySQL password
   database: "company", // your database name
   //port: 3306, // default MySQL port
 });


app.get("/api/occupation/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      USER_ID,
      OCCUPATION,
      INCOME
    FROM users
    WHERE USER_ID = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user info:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No user information found." });
    }

    return res.status(200).json(result[0]);
  });
});

app.listen(3003, () => {
  console.log("API running on port 3003");
});