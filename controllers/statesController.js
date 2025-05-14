// controllers/statesController.js
const State = require('../models/States');
const statesData = require('../models/statesData.json');

// GET all states (optionally filter by contiguous/non-contiguous)
exports.getAllStates = async (req, res) => {
  const contig = req.query.contig;
let results;
if (contig === 'true') {
  // contiguous states are all except AK and HI
  results = statesData.filter(st => st.code !== 'AK' && st.code !== 'HI');
} else if (contig === 'false') {
  // non-contiguous only AK and HI
  results = statesData.filter(st => st.code === 'AK' || st.code === 'HI');
} else {
  results = statesData;
}

  try {
    const docs = await State.find({});
    const map  = docs.reduce((m, d) => { m[d.stateCode] = d.funfacts; return m; }, {});
    const merged = results.map(st => {
      const info = { ...st };
      if (map[st.code]) info.funfacts = map[st.code];
      return info;
    });
    return res.json(merged);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single state full info
exports.getState = async (req, res) => {
  const { stateData, stateCode } = req;
  try {
    const stateDoc = await State.findOne({ stateCode });
    const response = { ...stateData };
    if (stateDoc && Array.isArray(stateDoc.funfacts)) {
      response.funfacts = stateDoc.funfacts;
    }
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET random fun fact for a state
exports.getRandomFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  try {
    const stateDoc = await State.findOne({ stateCode });
    if (!stateDoc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    const fact = stateDoc.funfacts[Math.floor(Math.random() * stateDoc.funfacts.length)];
    return res.json({ funfact: fact });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET state capital
exports.getStateCapital = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, capital: stateData.capital_city });
};

// GET state nickname
exports.getStateNickname = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, nickname: stateData.nickname });
};

// GET state population
exports.getStatePopulation = (req, res) => {
  const { stateData } = req;
  const popStr = stateData.population.toLocaleString('en-US');
  return res.json({ state: stateData.state, population: popStr });
};

// GET state admission date
exports.getStateAdmission = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, admitted: stateData.admission_date });
};

// POST new fun facts for a state
exports.createFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  const funfacts = req.body.funfacts;
  if (!funfacts) {
    return res.status(400).json({ message: 'State fun facts value required' });
  }
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array' });
  }
  try {
    let updated;
    const stateDoc = await State.findOne({ stateCode });
    if (stateDoc) {
      stateDoc.funfacts.push(...funfacts);
      updated = await stateDoc.save();
    } else {
      updated = await State.create({ stateCode, funfacts });
    }
    return res.status(201).json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH update a specific fun fact
exports.updateFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  const idxRaw = req.body.index;
  const newFact = req.body.funfact;
  if (idxRaw == null) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  if (typeof newFact !== 'string') {
    return res.status(400).json({ message: 'State fun fact value required' });
  }
  const idx = idxRaw - 1;
  try {
    const stateDoc = await State.findOne({ stateCode });
    if (!stateDoc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (idx < 0 || idx >= stateDoc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    stateDoc.funfacts[idx] = newFact;
    const updated = await stateDoc.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE a specific fun fact
exports.deleteFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  const idxRaw = req.body.index;
  if (idxRaw == null) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  const idx = idxRaw - 1;
  try {
    const stateDoc = await State.findOne({ stateCode });
    if (!stateDoc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (idx < 0 || idx >= stateDoc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    stateDoc.funfacts.splice(idx, 1);
    const updated = await stateDoc.save();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
