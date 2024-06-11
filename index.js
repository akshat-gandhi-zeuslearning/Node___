const fs = require("fs");
const mysql = require("mysql2");
const { parse } = require("csv-parse");
const multer = require("multer");
const express = require("express");

const app = express();
const port = 8080;

// Middleware for handling file uploads
const upload = multer({ dest: "uploads/" });

// Database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "aksattask2",
});

connection.connect((err) => {
  if (err) {
    console.error("Error in the connection:", err);
    return;
  }
  console.log("Database Connected");
});

// Endpoint for submitting form data
app.post("/submit", upload.single("file"), (req, res) => {
  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).json({
      error: "Please provide both textData and a file.",
    });
  }

  // If file is uploaded, handle it here
  const filePath = req.file.path;

  // Parse the CSV file
  fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({
        error: "Error reading file.",
      });
    }

    // Parse CSV data
    parse(data, { columns: true }, (parseErr, records) => {
      if (parseErr) {
        console.error("Error parsing CSV:", parseErr);
        return res.status(500).json({
          error: "Error parsing CSV.",
        });
      }

      // Insert records into the database in batches
      const batchSize = 1000; // Adjust batch size as needed
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const values = batch.map((record) => [
          record.id,
          record.name,
          record.email,
          record.contact,
        ]);
        const insertQuery = `INSERT INTO information(id, name, email, contact) VALUES ?`;
        connection.query(insertQuery, [values], (insertErr, result) => {
          if (insertErr) {
            console.error("Error inserting records:", insertErr);
          } else {
            console.log(`Inserted ${result.affectedRows} records`);
          }
        });
      }

      // Send success response
      res.status(200).json({
        message: "Form data submitted successfully!",
        formData: records,
      });
    });
  });
});
// Endpoint for fetching data from the database
app.get("/fetch", (req, res) => {
  const fetchQuery = `SELECT * FROM information`;
  connection.query(fetchQuery, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({
        error: "Error fetching data.",
      });
    }
    res.status(200).json({
      message: "Data fetched successfully!",
      data: results,
    });
  });
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
