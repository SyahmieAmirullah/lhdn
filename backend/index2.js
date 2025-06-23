const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost", // your MySQL host
  user: "root",
  password: "", // your MySQL password
  database: "jpn", // your database name
  //port: 3306, // default MySQL port
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// ===================== TEST CONNECTION =====================
app.get("/api/test-connection", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      console.error("Connection test failed:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database connection failed." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Database connection successful!" });
  });
});
// ===================== GET USER PROFILE =====================
app.get("/api/user-info/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      USER_ID AS user_id,
      FULLNAME AS fullname,
      ADDRESS AS address,
      USER_STATUS AS status
    FROM USER
    WHERE USER_ID = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(result[0]);
  });
});

//===================== START SERVER =====================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

