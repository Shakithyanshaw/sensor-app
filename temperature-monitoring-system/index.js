const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { check, validationResult } = require('express-validator');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS if your React app is served from a different origin

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'temperature_monitoring',
});

// Check MySQL connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + db.threadId);
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS,
  },
});

const ALERT_THRESHOLD = 30;

// Function to parse temperature from string (e.g., '35C' => 35)
const parseTemperature = (value) => {
  // Remove any non-digit characters and parse as float
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
  return numericValue;
};

// POST endpoint for receiving sensor data
app.post(
  '/data',
  [
    // Express-validator for input validation
    check('sensor_id').notEmpty(),
    check('date').isISO8601(),
    check('data_value').custom((value) => {
      const temperature = parseTemperature(value);
      if (isNaN(temperature)) {
        throw new Error(
          'Invalid value. Temperature should be numeric or numeric followed by unit (e.g., 35C)'
        );
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sensor_id, date, data_value } = req.body;
    const temperature = parseTemperature(data_value);

    db.query(
      'INSERT INTO sensor_data (sensor_id, date, data_value) VALUES (?, ?, ?)',
      [sensor_id, date, temperature], // Store temperature as float in database
      (err) => {
        if (err) {
          console.error('Error inserting data into database: ' + err);
          return res.status(500).send('Error storing data');
        }

        if (temperature > ALERT_THRESHOLD) {
          const mailOptions = {
            from: 'alert@example.com',
            to: 'user@example.com',
            subject: 'Temperature Alert',
            text: `Sensor ${sensor_id} reported a high temperature of ${temperature}C at ${date}`,
          };

          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.error('Error sending email: ' + error);
            } else {
              console.log('Email sent successfully');
            }
          });

          // Simulate SMS and phone call alerts
          console.log(
            `SMS sent to user: High temperature alert for sensor ${sensor_id}`
          );
          console.log(
            `Phone call made to user: High temperature alert for sensor ${sensor_id}`
          );
        }

        res.status(200).send('Data received and stored');
      }
    );
  }
);

// GET endpoint to fetch sensor data
app.get('/sensor-data', (req, res) => {
  db.query('SELECT * FROM sensor_data', (err, results) => {
    if (err) {
      console.error('Error fetching sensor data: ' + err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Press Ctrl+C to terminate.');
});
