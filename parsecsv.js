const fs = require("fs");
const mysql = require("mysql2");
const { parse } = require("csv-parse");
const multer = require("multer");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 8080;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "akshattask1",
});

connection.connect((err) => {
  if (err) {
    console.error("Error in the connection:", err);
    return;
  }
  console.log("Database Connected");

  const filePath = "./students_data - Students.csv";

  const parser = parse({ columns: true }, (err, records) => {
    if (err) {
      console.error("Error parsing CSV:", err);
      return;
    }

    records.forEach((record) => {
      const insertQuery = `INSERT INTO customers (id, name, email, contact) VALUES (?, ?, ?, ?)`;
      const values = [record.id, record.name, record.email, record.contact];

      connection.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting row:", err);
        } else {
          console.log(`Inserted row with id `);
        }
      });
    });
  });

  fs.createReadStream(filePath, { encoding: "UTF-8" }).pipe(parser);
});
