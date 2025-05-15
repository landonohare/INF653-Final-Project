const State      = require('../models/States');
const statesData = require('../models/statesData.json');


// GET /states/  — list all, with optional contig filter and merged funfacts
exports.getAllStates = async (req, res) => {
  const contig = req.query.contig;
  let results;
  if (contig === 'true') {
    results = statesData.filter(st => st.code !== 'AK' && st.code !== 'HI');
  } else if (contig === 'false') {
    results = statesData.filter(st => st.code === 'AK' || st.code === 'HI');
  } else {
    results = statesData;
  }

  try {
    const docs = await State.find({});
    const factsMap = docs.reduce((map, doc) => {
      map[doc.stateCode] = doc.funfacts;
      return map;
    }, {});

    const merged = results.map(st => {
      const out = { ...st };
      if (factsMap[st.code]) out.funfacts = factsMap[st.code];
      return out;
    });

    return res.json(merged);
  }
  catch (err) {
    console.error('Error in getAllStates:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /states/:state
exports.getState = async (req, res) => {
  const { stateData, stateCode } = req;
  try {
    const stateDoc = await State.findOne({ stateCode });
    const out = { ...stateData };
    if (Array.isArray(stateDoc?.funfacts)) out.funfacts = stateDoc.funfacts;
    return res.json(out);
  }
  catch (err) {
    console.error('Error in getState:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /states/:state/funfact
exports.getRandomFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  try {
    const stateDoc = await State.findOne({ stateCode });
    if (!stateDoc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    const fact = stateDoc.funfacts[Math.floor(Math.random() * stateDoc.funfacts.length)];
    return res.json({ funfact: fact });
  }
  catch (err) {
    console.error('Error in getRandomFunFact:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /states/:state/capital
exports.getStateCapital = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, capital: stateData.capital_city });
};

// GET /states/:state/nickname
exports.getStateNickname = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, nickname: stateData.nickname });
};

// GET /states/:state/population
exports.getStatePopulation = (req, res) => {
  const { stateData } = req;
  const popStr = stateData.population.toLocaleString('en-US');
  return res.json({ state: stateData.state, population: popStr });
};

// GET /states/:state/admission
exports.getStateAdmission = (req, res) => {
  const { stateData } = req;
  return res.json({ state: stateData.state, admitted: stateData.admission_date });
};

// POST /states/:state/funfact
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
    let doc = await State.findOne({ stateCode });
    if (doc) {
      doc.funfacts.push(...funfacts);
    } else {
      doc = new State({ stateCode, funfacts });
    }
    const saved = await doc.save();
    return res.status(201).json(saved);
  }
  catch (err) {
    console.error('Error in createFunFact:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /states/:state/funfact
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
    const doc = await State.findOne({ stateCode });
    if (!doc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (idx < 0 || idx >= doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    doc.funfacts[idx] = newFact;
    const saved = await doc.save();
    return res.json(saved);
  }
  catch (err) {
    console.error('Error in updateFunFact:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /states/:state/funfact
exports.deleteFunFact = async (req, res) => {
  const { stateData, stateCode } = req;
  const idxRaw = req.body.index;
  if (idxRaw == null) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  const idx = idxRaw - 1;
  try {
    const doc = await State.findOne({ stateCode });
    if (!doc?.funfacts?.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    if (idx < 0 || idx >= doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    doc.funfacts.splice(idx, 1);
    const saved = await doc.save();
    return res.json(saved);
  }
  catch (err) {
    console.error('Error in deleteFunFact:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
