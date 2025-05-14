// middleware/verifyState.js
const statesData = require('../models/statesData.json');
const validCodes = statesData.map(st => st.code);

module.exports = function verifyState(req, res, next) {
  const code = req.params.state?.toUpperCase();
  if (!code || !validCodes.includes(code)) {
    return res
      .status(404)
      .json({ message: 'Invalid state abbreviation parameter' });
  }
  // attach normalized data for controllers
  req.stateCode = code;
  req.stateData = statesData.find(st => st.code === code);
  next();
};
