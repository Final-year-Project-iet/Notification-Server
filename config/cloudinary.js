const cloudinary = require("cloudinary").v2;

require("dotenv").config();

exports.cloudinaryConnect = () => {

try{
      cloudinary.config({
        cloud_name : process.env.cloudname,
        api_key : process.env.apikey,
        api_secret : process.env.apisecret
      })

// console.log("Cloudinary connected sucessfully")
}

catch(error){
console.log(error);  }

}