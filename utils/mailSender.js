const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config();

console.log(process.env.MAIL_USER);
console.log(process.env.MAIL_PASS);
const mailSender = async (email, title, body) => {
    try{
            let transporter = nodemailer.createTransport({
                host:'smtp.gmail.com',
                auth:{
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
            })

            console.log(email , "first");
            let info = await transporter.sendMail({
                from: 'HomeAlert',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
}


module.exports = mailSender;