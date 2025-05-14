// middleware/verifyState.js
const statesData = require('../statesData.json');

// Build an array of valid codes, e.g. ["AL","AK",…]
const validCodes = statesData.map(st => st.code);

module.exports = function verifyState(req, res, next) {
  // Grab the raw URL param, uppercase it
  const code = req.params.state?.toUpperCase();
  // If it’s missing or not in our list, 404
  if (!code || !validCodes.includes(code)) {
    return res.status(404).json({ error: `State '${req.params.state}' not found` });
  }
  // Attach the normalized code & matching JSON data for handlers
  req.stateCode = code;
  req.stateData = statesData.find(st => st.code === code);
  next();
};
