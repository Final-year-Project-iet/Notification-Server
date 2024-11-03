const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const dotenv = require('dotenv');
const database = require('./config/database')
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const { uploadImageToCloudinary } = require("./utils/imageUploader");
const rateLimit = require('express-rate-limit');




const mailSender = require("./utils/mailSender")
const alertNotificationEmail = require('./mail/alert').alertNotificationEmail;

const { Expo } = require('expo-server-sdk');
const expo = new Expo();
const Device = require('./model/device');


dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


database.connect();
cloudinaryConnect();



const System = require('./model/system');
const Notification = require('./model/notification');


const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, 
  message: {
      success: false,
      message: 'Too many notifications sent. Please try again later.'
  }
});



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


async function sendRemoteNotification( 

 type , message1 

) { 
    const device = await Device.findOne({ userId: "2" });
    // console.log(device.expoPushToken);
    // console.log(device);
    const expoPushToken =  device.expoPushToken;
    const message = {
        to: expoPushToken,
        sound: 'default',
        title:  type,
        body:  message1,
        data: { someData: 'goes here'},
    };

    try {
        await expo.sendPushNotificationsAsync([message]);
        console.log('Notification sent');
    } catch (error) {
        console.error('Error sending notification:', error);
    }

}


// sendRemoteNotification();



app.post('/register-push-token',  async (req, res) => {
  console.log(req.body);
  const { userId, expoPushToken } = req.body;
  
  if (!Expo.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ success: false, message: 'Invalid Expo push token' });
  }

  try {
    await Device.findOneAndUpdate(
      { userId },
      { expoPushToken },
      { upsert: true }
    );
    res.status(200).json({ success: true, message: 'Push token registered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register token' });
  }
});






app.post('/send-notification', notificationLimiter, async (req, res) => {
  let { email, phone, message , type ,remote} = req.body;

  // message = message+new Date().toLocaleString(); 
   // i want to add current time to the message   

    message = message + " " + new Date().toLocaleString();

   console.log("message is " , message);

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
    if (remote) {
      await sendRemoteNotification( type , message );
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


app.post('/upload-image', notificationLimiter ,  async (req, res) => { 
     
      const { file } = req.files;
      const { folder, height, quality } = req.body;
  
      try {
          const result = await uploadImageToCloudinary(file, folder, height, quality);
          const device = await Device.findOne({ userId: "2" });
          device.images.push(result.url);
          await device.save();
          res.status(200).json({ success: true, data: result.url });
      } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, message: 'Failed to upload image' });
      }
  
  }
    
)


app.get('/images', async (req, res) => { 

    try {
        const device = await Device.findOne({ userId: "2" });
        res.status(200).json({ success: true, data: device.images });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to get images' });
    }

})

app.post("unlock" , async (req, res) => { 
   const { password } = req.body;
    try {
      const system = await System.findOne({ systemId: 1 });
      if (system.password !== password) {
          return res.status(400).json({ success: false, message: 'Invalid password' });
      }
  
      system.systemStatus = "Disarmed";
      await system.save();
      res.status(200).json({ success: true, message: 'System status updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update system status' });
  }
})
