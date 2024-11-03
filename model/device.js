const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: String,
  expoPushToken: String,
  images : [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);