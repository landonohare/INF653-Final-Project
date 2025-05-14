const State = require('../models/States');
const statesData = require('../models/statesData.json');

// Helper: find state data from JSON by state code (case-insensitive)
const getStateDataByCode = (code) => statesData.find(st => st.code === code);

// GET all states (optionally filter by contiguous/non-contiguous)
const getAllStates = async (req, res) => {
  const contig = req.query.contig;
  let results = statesData;
  if (contig === 'true') {
    // Contiguous only (filter out AK and HI)
    results = statesData.filter(st => st.contiguous);
  } else if (contig === 'false') {
    // Non-contiguous only
    results = statesData.filter(st => !st.contiguous);
  }

  try {
    const statesWithFacts = await State.find({});
    const funfactsMap = {};
    statesWithFacts.forEach(doc => { funfactsMap[doc.stateCode] = doc.funfacts; });

    const merged = results.map(st => {
      const info = { ...st };
      if (funfactsMap[st.code]) info.funfacts = funfactsMap[st.code];
      return info;
    });
    return res.json(merged);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single state full info
const getState = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (stateDoc && Array.isArray(stateDoc.funfacts)) {
      stateData.funfacts = stateDoc.funfacts;
    }
    return res.json(stateData);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET random fun fact for a state
const getRandomFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    const arr = stateDoc.funfacts;
    const fact = arr[Math.floor(Math.random() * arr.length)];
    return res.json({ funfact: fact });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET state capital
const getStateCapital = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  return res.json({ state: stateData.state, capital: stateData.capital_city });
};

// GET state nickname
const getStateNickname = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  return res.json({ state: stateData.state, nickname: stateData.nickname });
};

// GET state population
const getStatePopulation = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  const popStr = stateData.population.toLocaleString('en-US');
  return res.json({ state: stateData.state, population: popStr });
};

// GET state admission date
const getStateAdmission = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  return res.json({ state: stateData.state, admitted: stateData.admission_date });
};

// POST new fun facts for a state
const createFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  const funfacts = req.body.funfacts;
  if (!funfacts) {
    return res.status(400).json({ message: 'State fun facts value required' });
  }
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array' });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    let updated;
    if (stateDoc) {
      stateDoc.funfacts.push(...funfacts);
      updated = await stateDoc.save();
    } else {
      updated = await State.create({ stateCode: code, funfacts });
    }
    return res.status(201).json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH update a specific fun fact
const updateFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
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
    const stateDoc = await State.findOne({ stateCode: code });
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
const deleteFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: 'Invalid state abbreviation parameter' });
  }
  const idxRaw = req.body.index;
  if (idxRaw == null) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  const idx = idxRaw - 1;
  try {
    const stateDoc = await State.findOne({ stateCode: code });
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

module.exports = {
  getAllStates,
  getState,
  getRandomFunFact,
  getStateCapital,
  getStateNickname,
  getStatePopulation,
  getStateAdmission,
  createFunFact,
  updateFunFact,
  deleteFunFact
};