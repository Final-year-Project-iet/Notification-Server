const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const dotenv = require('dotenv');
const database = require('./config/database')

const mailSender = require("./utils/mailSender")
const alertNotificationEmail = require('./mail/alert').alertNotificationEmail;

dotenv.config();


const app = express();
app.use(express.json());



database.connect();

const System = require('./model/system');



const createInitialSystem = async () => {
  try {
    const existingSystem = await System.findOne({ systemId: 1 });
    if (!existingSystem) {
      await System.create({
        systemName: 'Default System',
        systemId: 1,
        systemStatus: 'Armed',
        password: 1234
      });
      console.log('Initial system created');
    }else{
      console.log('System already exists');
    }
  } catch (error) {
    console.error('Error creating initial system:', error);
  }
};

createInitialSystem();
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);


const sendSMS = async (phone, message) => {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
};







app.listen(3000, () => {
    console.log('Server is running on port 3000');
}
);



app.post('/send-notification', async (req, res) => {
  const { email, phone, message } = req.body;

  try {
    if (email) {
      const name = "John Doe";
const alertType = "Security Breach";
const alertMessage = "An unauthorized access attempt was detected ";
const timeOfAlert = new Date().toLocaleString();


const emailContent = alertNotificationEmail(name, alertType, alertMessage, timeOfAlert);
       const response = await mailSender(
        email,
        "Alert Notification",
        emailContent
       )

        console.log("sending the email " , response);
    }
    if (phone) {
      const res =  await sendSMS(phone, message);
      console.log("sending the " , res);
    }
    res.status(200).json({ success: true, message: 'Notification sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});
