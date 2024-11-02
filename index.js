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
const Notification = require('./model/notification');



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
  const { email, phone, message , type } = req.body;

  try {
    if (email) {
      const name = "Sai Anish";
const alertType =  type;
const alertMessage = message;
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

    await Notification.create({
      alertType: type,
      alertMessage: message,
    });


    res.status(200).json({ success: true, message: 'Notification sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});


app.get('/status', async (req, res) => { 


    try {
        const system = await System.findOne({ systemId: 1 });
        res.status(200).json({ success: true, data: system });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get system status' });
    }


})


app.post('/set-status', async (req, res) => {

    const { systemStatus, password } = req.body;

    try {
        const system = await System.findOne({ systemId: 1 });
        if (system.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        system.systemStatus = systemStatus;
        await system.save();
        res.status(200).json({ success: true, message: 'System status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update system status' });
    }
 })


 app.get('/notifications', async (req, res) => { 

    try {
        const notifications = await Notification.find();
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }

 })



app.get('/notifications/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const notification = await Notification.findById(id);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get notification' });
    }

})


app.get('/system' , async (req, res) => { 


    try {
        const system = await System.findOne({ systemId: 1 });
        var recentActivity = await Notification.find().sort({ createdAt: -1 }).limit(5);
        res.status(200).json({ success: true, data: { system, recentActivity } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get system' });
    }
})