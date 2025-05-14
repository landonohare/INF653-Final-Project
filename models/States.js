const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,  // ensure stored in uppercase
    maxLength: 2
  },
  funfacts: [String]  // array of fun fact strings
});

module.exports = mongoose.model('State', stateSchema);
