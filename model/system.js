
const mongoose = require('mongoose');


const systemSchema = new mongoose.Schema({ 
      systemName: {
          type: String,
           required: true,
       },
         
       systemId :{
              type: Number,
              required: true,

       },

        systemStatus:{
            enum: ["Armed", "Unarmed"],
            type: String,
            required: true,
        },

           
        password: {
            type: Number,
            default: 1234,
            required: true,
        },


})


module.exports = mongoose.model("System", systemSchema);