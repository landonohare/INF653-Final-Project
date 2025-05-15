// middleware/verifyState.js
// Normalises a :state param to uppercase 2‑letter code and checks validity.
// If invalid, respond 404 with required JSON message.
// Otherwise attach { stateCode, stateData } to req for downstream handlers.
// ---------------------------------------------------------------------------

const statesData = require('../models/statesData.json');
const validCodes = statesData.map(st => st.code);

module.exports = (req, res, next) => {
  const code = req.params.state?.toUpperCase();
  if(!code || !validCodes.includes(code)){
    return res.status(404).json({ message:'Invalid state abbreviation parameter' });
  }
  req.stateCode = code;
  req.stateData = statesData.find(st=>st.code===code);
  next();
};