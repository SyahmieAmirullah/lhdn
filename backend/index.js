const express = require("express"); //libraries
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000; // port number

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "20.2.209.23", //Server IP address
  user: "syahmie", //username
  password: "1234", // password
  database: "lhdn", //database name
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

// ===================== REGISTER =====================
app.post("/api/register", (req, res) => {
  const { user_id, username, user_password, user_email, user_phone } = req.body;

  if (!user_id || !username || !user_password || !user_email || !user_phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const hashedPassword = md5(user_password);

  const sql = `
    INSERT INTO USERS 
    (USER_ID, USERNAME,USER_PASS, USER_EMAIL, USER_PHONE, PAYER_STATUS) 
    VALUES (?, ?, ?, ?, ?, 'ACTIVE')
  `;

  db.query(
    sql,
    [user_id, username, hashedPassword, user_email, user_phone],
    (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ message: "Database error." });
      }

      return res.status(200).json({ message: "User registered successfully." });
    }
  );
});

// ===================== LOGIN =====================
app.post("/api/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const hashedPassword = md5(password);

  const sql = `
    SELECT USER_ID, USERNAME, USER_ROLE 
    FROM USERS 
    WHERE USER_ID = ? AND USER_PASS = ?
  `;

  db.query(sql, [identifier, hashedPassword], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];
    const role = user.USER_ROLE.toLowerCase(); // Ensure role is either 'admin' or 'payer'

    // ✅ Include username, role, and userId in the token
    const token = jwt.sign(
      {
        userId: user.USER_ID,
        username: user.USERNAME,
        role: role,
      },
      "your_secret_key", // Or use process.env.JWT_SECRET
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token: token,
      userId: user.USER_ID,
      username: user.USERNAME,
      role: role,
    });
  });
});

// ===================== RESET PASSWORD =====================
app.post("/api/reset-password", (req, res) => {
  const { identifier, newPassword } = req.body;

  if (!identifier || !newPassword) {
    return res.status(400).json({ message: "Missing identifier or password" });
  }

  const hashedPassword = md5(newPassword);
  const sql = "UPDATE USERS SET USER_PASS = ? WHERE USER_ID = ?";

  db.query(sql, [hashedPassword, identifier], (err, result) => {
    if (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  });
});

// ===================== GET USER PROFILE =====================
app.get("/api/profile/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      USERS.USER_ID AS user_id,
      USER_PROFILE.FULL_NAME AS fullname,
      USER_PROFILE.USER_ADDR AS address,
      USERS.USER_EMAIL AS email,
      USERS.PAYER_STATUS AS payerStatus,
      USERS.USER_PHONE AS phone,
      USER_PROFILE.USER_OCCUPATION AS occupation,
      USER_PROFILE.INCOME_BRACKET AS incomeBracket,
      CLASS.CLASS_CAT AS socialClass
    FROM USERS
    LEFT JOIN USER_PROFILE ON USERS.USER_ID = USER_PROFILE.USER_ID
    LEFT JOIN CLASS ON USERS.CLASS_ID = CLASS.CLASS_ID
    WHERE USERS.USER_ID = ?
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
// ===================== INSERT USER PROFILE =====================
app.post("/api/profile/:userId", (req, res) => {
  const { userId } = req.params; // userId from URL (coming from sessionStorage)
  const { full_name, user_addr, user_occupation, income_bracket } = req.body;

  console.log("Received data for userId:", userId);
  console.log("Data to insert into USER_PROFILE:", { full_name, user_addr, user_occupation, income_bracket });

  // Define the social class based on income bracket
  let classId = null;

  // Check income bracket ranges directly instead of using "includes"
  if (income_bracket <= 5249) {
    classId = 1; // B40
  } else if (income_bracket >= 5250 && income_bracket <= 11819) {
    classId = 2; // M40
  } else if (income_bracket >= 11820) {
    classId = 3; // T20
  } else {
    return res.status(400).json({ error: "Invalid income bracket provided" });
  }

  // Insert into USER_PROFILE table
  db.query(
    `INSERT INTO USER_PROFILE (USER_ID, FULL_NAME, USER_ADDR, USER_OCCUPATION, INCOME_BRACKET) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, full_name, user_addr, user_occupation, income_bracket],
    (err, results) => {
      if (err) {
        console.error("Error inserting into USER_PROFILE table:", err);
        return res.status(500).json({ error: "Error inserting into USER_PROFILE table" });
      }

      if (results.affectedRows === 0) {
        console.log("No rows affected. User profile may not exist.");
        return res.status(404).json({ error: "User profile not found" });
      }

      console.log("Profile inserted successfully into USER_PROFILE.");

      // Update the USER table with the class_id based on income bracket
      db.query(
        `UPDATE USERS SET CLASS_ID = ? WHERE USER_ID = ?`,
        [classId, userId],
        (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Error updating class_id in USER table:", updateErr);
            return res.status(500).json({ error: "Error updating class_id in USER table" });
          }

          if (updateResults.affectedRows === 0) {
            console.log("No rows affected while updating class_id.");
            return res.status(404).json({ error: "User not found to update class_id" });
          }

          console.log("User's class_id updated successfully.");
          return res.json({ message: "Profile inserted and class_id updated successfully" });
        }
      );
    }
  );
});

// ===================== UPDATE USER PROFILE =====================
app.put("/api/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const { user_addr, user_occupation, income_bracket } = req.body;

  // Ensure that at least one of the fields is provided
  if (!user_addr && !user_occupation && !income_bracket) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  // Helper function to get the class ID based on the income bracket
  const getClassIdFromIncome = (incomeBracket) => {
    const income = parseInt(incomeBracket.replace(/[^\d.-]/g, '')); // Remove non-numeric characters

    if (income <= 5249) {
      return 1; // B40 class ID
    } else if (income >= 5250 && income < 11819) {
      return 2; // M40 class ID
    } else if (income >= 11820) {
      return 3; // T20 class ID
    } else {
      return null; // Unknown class ID
    }
  };

  // Create a list of fields to update, avoiding empty fields
  const updateFields = [];
  const updateValues = [];

  if (user_addr) {
    updateFields.push("USER_ADDR = ?");
    updateValues.push(user_addr);
  }
  if (user_occupation) {
    updateFields.push("USER_OCCUPATION = ?");
    updateValues.push(user_occupation);
  }

  // Update income_bracket and corresponding class_id in USER_PROFILE
  let newClassId = null;
  if (income_bracket) {
    newClassId = getClassIdFromIncome(income_bracket);
    if (newClassId !== null) {
      updateFields.push("INCOME_BRACKET = ?");
      updateValues.push(income_bracket);
    }
  }

  // If no valid fields to update, return error
  if (updateFields.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  // Add userId to the end of the parameters for USER_PROFILE update
  updateValues.push(userId);

  // Construct the SQL query dynamically based on which fields are provided
  const userProfileQuery = `UPDATE USER_PROFILE SET ${updateFields.join(", ")} WHERE USER_ID = ?`;

  // Update USER_PROFILE first
  db.query(userProfileQuery, updateValues, (err, results) => {
    if (err) {
      console.error("Error updating USER_PROFILE:", err);
      return res.status(500).json({ error: "Error updating user profile" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // If the income bracket was updated, update the CLASS_ID in the USERS table
    if (newClassId !== null) {
      const userUpdateQuery = "UPDATE USERS SET CLASS_ID = ? WHERE USER_ID = ?";
      db.query(userUpdateQuery, [newClassId, userId], (err, results) => {
        if (err) {
          console.error("Error updating USER CLASS_ID:", err);
          return res.status(500).json({ error: "Error updating user class" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found for class update" });
        }

        res.json({ message: "Profile updated successfully, including class ID" });
      });
    } else {
      res.json({ message: "Profile updated successfully, no class update needed" });
    }
  });
});

// ===================== POST SOCIAL CLASS ====================
app.post("/api/class", (req, res) => {
  const {
    CLASS_ID,
    CLASS_CAT,
    INCOME_RANGE_MIN,
    INCOME_RANGE_MAX,
    CLASS_DESC,
  } = req.body;

  console.log("Received class data:", req.body); // Debug line

  if (!CLASS_ID || !CLASS_CAT || !INCOME_RANGE_MIN || !INCOME_RANGE_MAX) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled.",
    });
  }

  const sql = `
    INSERT INTO CLASS (CLASS_ID, CLASS_CAT, INCOME_RANGE_MIN, INCOME_RANGE_MAX, CLASS_DESC)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [CLASS_ID, CLASS_CAT, INCOME_RANGE_MIN, INCOME_RANGE_MAX, CLASS_DESC],
    (err, result) => {
      if (err) {
        console.error("Insert class error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      return res.json({ success: true, message: "Class added successfully" });
    }
  );
});
// ===================== GET SOCIAL CLASS =====================
app.get("/api/class", (req, res) => {
  const sql = `
    SELECT 
      CLASS_ID,
      CLASS_CAT,
      INCOME_RANGE_MIN,
      INCOME_RANGE_MAX,
      CLASS_DESC
    FROM CLASS
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching classes:", err);
      return res.status(500).json({ message: "Database error." });
    }

    return res.status(200).json(results);
  });
});

// ===================== GET TAX INFO =====================
app.get("/api/tax/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      USER_ID,
      TAX_SUBMIT.SUBMIT_ID,
      TAX_YEAR,
      SUBMIT_DATE,
      TOTAL_INCOME * 12 AS TOTAL_INCOME,
      TAXABLE_INCOME,
      TAX_DUE AS TAX_DUE,
      SUBMIT_STATUS
    FROM TAX_SUBMIT
    WHERE USER_ID = ?
    ORDER BY SUBMIT_ID DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching tax info:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No tax information found." });
    }

    return res.status(200).json(result[0]);
  });
});
// ===================== GET ALL USERS =====================
app.get("/api/admin/users", (req, res) => {
  const sql = `
    SELECT 
      USER_ID AS id,
      USERNAME AS username,
      USER_EMAIL AS email,
      USER_PHONE AS phone,
      PAYER_STATUS AS status
    FROM USERS
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Database error." });
    }

    return res.status(200).json(results);
  });
});

// ===================== DELETE USER =====================
app.delete("/api/admin/users/:userId", (req, res) => {
  const userId = req.params.userId;

  // Step 1: Delete from TAX_PAYMENT
  const deletePayment = `
    DELETE FROM TAX_PAYMENT 
    WHERE SUBMIT_ID IN (
      SELECT SUBMIT_ID FROM TAX_SUBMIT WHERE USER_ID = ?
    )`;

  db.query(deletePayment, [userId], (err) => {
    if (err) {
      console.error("Error deleting from TAX_PAYMENT:", err);
      return res.status(500).json({ message: "Error deleting from TAX_PAYMENT" });
    }

    // Step 2: Delete from DEDUCT
    const deleteDeduct = `
      DELETE FROM DEDUCT 
      WHERE SUBMIT_ID IN (
        SELECT SUBMIT_ID FROM TAX_SUBMIT WHERE USER_ID = ?
      )`;

    db.query(deleteDeduct, [userId], (err) => {
      if (err) {
        console.error("Error deleting from DEDUCT:", err);
        return res.status(500).json({ message: "Error deleting from DEDUCT" });
      }

      // Step 3: Delete from TAX_SUBMIT
      const deleteSubmit = "DELETE FROM TAX_SUBMIT WHERE USER_ID = ?";
      db.query(deleteSubmit, [userId], (err) => {
        if (err) {
          console.error("Error deleting from TAX_SUBMIT:", err);
          return res.status(500).json({ message: "Error deleting from TAX_SUBMIT" });
        }

        // Step 4: Delete from user_profile (foreign key constraint)
        const deleteProfile = "DELETE FROM USER_PROFILE WHERE USER_ID = ?";
        db.query(deleteProfile, [userId], (err) => {
          if (err) {
            console.error("Error deleting from user_profile:", err);
            return res.status(500).json({ message: "Error deleting from user_profile" });
          }

          // Step 5: Finally delete the user
          const deleteUser = "DELETE FROM USERS WHERE USER_ID = ?";
          db.query(deleteUser, [userId], (err, result) => {
            if (err) {
              console.error("Error deleting from USER:", err);
              return res.status(500).json({ message: "Error deleting from USER" });
            }

            if (result.affectedRows === 0) {
              return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ message: "User and all related data deleted successfully" });
          });
        });
      });
    });
  });
});

// ===================== ADMIN DASHBOARD TOTAL USERS =====================
app.get("/api/admin/total-users", (req, res) => {
  const query = "SELECT COUNT(*) AS totalUsers FROM USERS";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching total users:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({ totalUsers: results[0].totalUsers });
  });
});

// ===================== ADMIN DASHBOARD TOTAL TAX COLLECTED =====================
app.get("/api/admin/total-tax", (req, res) => {
  const query = "SELECT SUM(payment_amount) AS totalTax FROM TAX_PAYMENT";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching total tax:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const totalTax = result[0].totalTax || 0; // Handle null case if no payments
    res.status(200).json({ totalTax });
  });
});

// ===================== ADMIN DASHBOARD TOTAL TRANSACTIONS =====================
app.get("/api/admin/total-transactions", (req, res) => {
  const query = "SELECT COUNT(*) AS totalTransactions FROM TAX_PAYMENT";

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching total transactions:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({ totalTransactions: result[0].totalTransactions });
  });
});

// ===================== SUBMIT TAX =====================
app.post("/api/submit-tax", (req, res) => {
  const {
    userId,
    taxYear,
    submitDate,
    totalIncome,
    taxableIncome,
    taxDue,
    submitStatus,
  } = req.body;

  if (!userId || !taxYear || !submitDate || !totalIncome || !taxableIncome) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO TAX_SUBMIT (user_id, tax_year, submit_date, total_income, taxable_income, tax_due, submit_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [userId, taxYear, submitDate, totalIncome, taxableIncome, taxDue, submitStatus];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting tax submission:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json({ message: "Tax form submitted successfully" });
  });
});
// ===================== GET TAX SUBMISSIONS =====================
app.get("/api/tax-submit/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      TAX_YEAR,
      SUBMIT_DATE,
      TOTAL_INCOME * 12 AS total_income,
      TAXABLE_INCOME AS taxable_income,
      TAX_DUE AS tax_due,
      SUBMIT_STATUS
    FROM TAX_SUBMIT
    WHERE USER_ID = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching tax submissions:", err);
      return res.status(500).json({ message: "Database error." });
    }

    return res.status(200).json(results);
  });
});
// ===================== TAX DEDUCTION =====================
app.post("/api/deduct", async (req, res) => {
  const {
    submitId,
    userId,
    deductions, // Array of { label, amount }
  } = req.body;

  // Validate required fields
  if (!submitId || !userId || !Array.isArray(deductions)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Step 1: Check if submitId exists and belongs to userId
    const [submitCheck] = await db
      .promise()
      .execute(
        "SELECT tax_due FROM TAX_SUBMIT WHERE submit_id = ? AND user_id = ?",
        [submitId, userId]
      );

    if (submitCheck.length === 0) {
      return res.status(400).json({ error: "Invalid submitId for the given userId" });
    }

    const originalTaxDue = parseFloat(submitCheck[0].tax_due);
    let totalDeduction = 0;

    // Step 2: Insert deductions
    for (const deduction of deductions) {
      const amount = parseFloat(deduction.amount);
      if (isNaN(amount) || amount < 0) continue;

      totalDeduction += amount;

      await db
        .promise()
        .execute(
          "INSERT INTO DEDUCT (submit_id, deduct_type, deduct_amount) VALUES (?, ?, ?)",
          [submitId, deduction.label, amount]
        );
    }

    // Step 3: Calculate and update tax_due (not below zero)
    const newTaxDue = Math.max(0, originalTaxDue - totalDeduction);

    await db
      .promise()
      .execute(
        "UPDATE TAX_SUBMIT SET tax_due = ? WHERE submit_id = ?",
        [newTaxDue, submitId]
      );

    // Step 4: Send success response
    res.status(200).json({
      message: "Deductions submitted and tax_due updated successfully.",
      originalTaxDue,
      totalDeduction,
      newTaxDue
    });

  } catch (err) {
    console.error("❌ Error inserting deductions or updating tax_due:", err);
    res.status(500).json({ error: "Internal se rver error" });
  }
});


// Get total deduction for a user
app.get("/api/deduction/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT SUM(d.deduct_amount) AS totalDeduction
FROM DEDUCT d
JOIN TAX_SUBMIT t ON d.submit_id = t.submit_id
WHERE t.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching deduction:", err);
      return res.status(500).json({ message: "Database error" });
    }
    const total = results[0].totalDeduction || 0;
    res.status(200).json({ totalDeduction: total });
  });
});

//====================== GET PAYMENT =====================
app.get('/payment/:userId', async (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT u.USER_ID,t.SUBMIT_ID, up.FULL_NAME, t.TAX_DUE, p.PAYMENT_STATUS
    FROM USERS u
    JOIN TAX_SUBMIT t ON u.USER_ID = t.USER_ID
    JOIN USER_PROFILE up ON u.USER_ID = up.USER_ID
    LEFT JOIN TAX_PAYMENT p ON t.SUBMIT_ID = p.SUBMIT_ID
    WHERE u.USER_ID = ?
    ORDER BY t.SUBMIT_ID DESC
    LIMIT 1
  `;
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});
//====================== POST PAYMENT =====================
app.post('/payment/insert', (req, res) => {
  const { submit_id, payment_amount, transaction_ref } = req.body;
  const status = parseFloat(payment_amount) >= 0 ? 'PAID' : 'PENDING';

  const getTaxDueQuery = `SELECT TAX_DUE FROM TAX_SUBMIT WHERE SUBMIT_ID = ?`;

  db.query(getTaxDueQuery, [submit_id], (err, taxResults) => {
    if (err) return res.status(500).json({ message: "Error fetching tax due", error: err });
    if (taxResults.length === 0) return res.status(404).json({ message: "SUBMIT_ID not found" });

    const oldTaxDue = parseFloat(taxResults[0].TAX_DUE);
    const payment = parseFloat(payment_amount);
    const computedBalance = payment - oldTaxDue;

    // Insert or update payment
    const paymentQuery = `
      INSERT INTO TAX_PAYMENT (SUBMIT_ID, PAYMENT_DATE, PAYMENT_AMOUNT, TRANSACTION_REF, PAYMENT_STATUS)
      VALUES (?, NOW(), ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        PAYMENT_DATE = NOW(),
        PAYMENT_AMOUNT = ?,
        TRANSACTION_REF = ?,
        PAYMENT_STATUS = ?
    `;

    const paymentParams = [
      submit_id,
      payment,
      transaction_ref,
      status,

      payment,
      transaction_ref,
      status
    ];

    db.query(paymentQuery, paymentParams, (paymentErr) => {
      if (paymentErr) return res.status(500).json({ message: "Error inserting payment", error: paymentErr });

      // If full payment, set TAX_DUE = 0
      if (payment >= oldTaxDue) {
        const updateTaxDueQuery = `UPDATE TAX_SUBMIT SET TAX_DUE = 0 WHERE SUBMIT_ID = ?`;
        db.query(updateTaxDueQuery, [submit_id], (updateErr) => {
          if (updateErr) return res.status(500).json({ message: "Error updating TAX_DUE", error: updateErr });

          return res.json({
            message: "Full payment recorded",
            submit_id,
            payment_amount: payment,
            old_tax_due: oldTaxDue,
            new_tax_due: 0,
            balance: computedBalance,
            payment_status: status
          });
        });
      } else {
        // Partial payment only recorded
        return res.json({
          message: "Partial payment recorded",
          submit_id,
          payment_amount: payment,
          old_tax_due: oldTaxDue,
          new_tax_due: oldTaxDue,
          balance: computedBalance,
          payment_status: status
        });
      }
    });
  });
});

//====================== POST SIDE INCOME =====================
app.post("/api/income", (req, res) => {
  const { userId, amount, incomeType, year } = req.body;

  const sql = `
    INSERT INTO INCOME (user_id, income_amount, source_type)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [userId, amount, incomeType], (err, result) => {
    if (err) {
      console.error("Error inserting income:", err);
      return res.status(500).json({ message: "Database error." });
    }

    return res.status(200).json({ message: "Income recorded successfully." });
  });
});

//===================== START SERVER =====================
/*app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});*/
//===================== OPEN IP LISTEN =====================
app.listen(3000, '0.0.0.0', () => {
  console.log("Server running at http://0.0.0.0:3000");
});
