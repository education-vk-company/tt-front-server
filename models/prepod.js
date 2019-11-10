const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrepodSchema = new Schema({
  name: String,
  last_name: String,
  severity: Number,
});

module.exports = mongoose.model('Prepod', PrepodSchema);
