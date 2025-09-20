const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/visa', { useNewUrlParser: true, useUnifiedTopology: true });

// Basic User schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  documents: [String],
  notifications: [String],
  application: Object
});
const User = mongoose.model('User', UserSchema);

let adminOTP = null;
let adminOTPExpiry = null;

// Configure nodemailer (use your real email credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourgmail@gmail.com', // replace with your Gmail
    pass: 'your-app-password'    // replace with your Gmail app password
  }
});

// Generate and send OTP
function sendAdminOTP(email) {
  adminOTP = Math.floor(100000 + Math.random() * 900000).toString();
  adminOTPExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
  const mailOptions = {
    from: 'yourgmail@gmail.com',
    to: email,
    subject: 'Your Admin OTP',
    text: `Your one-time password is: ${adminOTP}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP:', error);
    } else {
      console.log('OTP sent:', info.response);
    }
  });
}

// Admin login route
app.post('/admin/login', async (req, res) => {
  const { email, otp } = req.body;
  if (email !== 'alexxosef@gmail.com') {
    return res.status(401).json({ success: false, message: 'Unauthorized email' });
  }
  if (!otp) {
    sendAdminOTP(email);
    return res.json({ success: false, message: 'OTP sent to email' });
  }
  if (otp === adminOTP && Date.now() <= adminOTPExpiry) {
    adminOTP = null;
    adminOTPExpiry = null;
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }
});

// Get user details
app.get('/admin/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// Get all users
app.get('/admin/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// Send notification to user
app.post('/admin/notify/:id', async (req, res) => {
  // Implement notification logic here
  res.json({ success: true });
});

// Add nodemailer config for user confirmation
function sendUserConfirmation(email, userId, password) {
  const mailOptions = {
    from: 'yourgmail@gmail.com',
    to: email,
    subject: 'Australia Job Visa Application Confirmation',
    text: `Your application is received.\nUser ID: ${userId}\nPassword: ${password}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending user confirmation:', error);
    } else {
      console.log('User confirmation sent:', info.response);
    }
  });
}

// User application route
app.post('/user/apply', upload.fields([
  { name: 'document1', maxCount: 1 },
  { name: 'document2', maxCount: 1 },
  { name: 'document3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, passport, dob, education, occupation, experience } = req.body;
    const documents = [
      req.files['document1'] ? req.files['document1'][0].filename : null,
      req.files['document2'] ? req.files['document2'][0].filename : null,
      req.files['document3'] ? req.files['document3'][0].filename : null
    ];
    const application = { name, email, phone, passport, dob, education, occupation, experience };
    // Generate userId and password
    const userId = 'U' + Math.floor(100000 + Math.random() * 900000);
    const password = Math.random().toString(36).slice(-8);
    const user = new User({ email, password, application, documents });
    await user.save();
    sendUserConfirmation(email, userId, password);
    res.json({ success: true, userId, password });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve uploaded documents for download/viewing
app.get('/user/document/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath);
});

// WebSocket server for real-time notifications
const wss = new WebSocketServer({ port: 8081 });
const clients = {};

wss.on('connection', ws => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.user && data.command) {
        // Device control: send command to user device (simulate)
        if (clients[data.user]) {
          clients[data.user].send(`Admin command: ${data.command}`);
        }
        ws.send(`Command sent to ${data.user}: ${data.command}`);
      } else if (data.user && data.type === 'register') {
        // Register user device connection
        clients[data.user] = ws;
        ws.send(`Device registered for ${data.user}`);
      } else if (data.notification) {
        // Broadcast notification to all admin clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(`Notification: ${data.notification}`);
          }
        });
      }
    } catch (err) {
      ws.send('Error: Invalid message format');
    }
  });
});

app.listen(3001, () => console.log('Server running on port 3001'));
