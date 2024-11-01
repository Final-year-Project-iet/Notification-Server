const mongoose = require("mongoose");
   

const notificationSchema = new mongoose.Schema({ 
    

    alertType: {
        enum: ["Critical", "Normal", "Warning"],
        type: String,
        required: true,
    },

    inAppNotification: { 
        type: Boolean,
        default: true,
    },

    alertMessage: {
        type: String,
        required: true,
    },


    timeOfAlert: {
        type: Date,
        default: Date.now,
    },


    isRead: {
        type: Boolean,
        default: false,
    },

})


module.exports = mongoose.model("Notification", notificationSchema);