const State = require('../models/States');
const statesData = require('../statesData.json');

// Helper: find state data from JSON by state code (case-insensitive)
const getStateDataByCode = (code) => {
  return statesData.find(st => st.code === code);
};

// GET all states (optionally filter by contiguous/non-contiguous)
const getAllStates = async (req, res) => {
  // Check query parameter for contiguous filtering
  const contig = req.query.contig;
  let results = statesData;
  if (contig === 'true') {
    // Contiguous only (filter out Alaska and Hawaii)
    results = statesData.filter(st => st.contiguous);
  } else if (contig === 'false') {
    // Non-contiguous only (Alaska and Hawaii)
    results = statesData.filter(st => !st.contiguous);
  }
  try {
    // Find all state funfacts from DB in one go
    const statesWithFacts = await State.find({});
    // Create a map of stateCode -> funfacts array
    const funfactsMap = {};
    statesWithFacts.forEach(doc => {
      funfactsMap[doc.stateCode] = doc.funfacts;
    });
    // Merge funfacts into the results if present
    const mergedResults = results.map(st => {
      const stateCode = st.code;
      // shallow copy to avoid mutating original data
      const stateInfo = { ...st };
      if (funfactsMap[stateCode]) {
        stateInfo.funfacts = funfactsMap[stateCode];
      }
      return stateInfo;
    });
    res.json(mergedResults);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET single state full info
const getState = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  // Merge funfacts if present
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (stateDoc && stateDoc.funfacts) {
      // include funfacts in response if exists in DB
      stateData.funfacts = stateDoc.funfacts;
    }
    res.json(stateData);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET random fun fact for a state
const getRandomFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
      // No fun facts available for this state
      return res.json({ message: `No Fun Facts found for ${stateData.state}` });
    }
    // Pick a random fun fact
    const funfactsArr = stateDoc.funfacts;
    const randomIndex = Math.floor(Math.random() * funfactsArr.length);
    const randomFact = funfactsArr[randomIndex];
    res.json({ funfact: randomFact });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET state capital
const getStateCapital = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  res.json({ capital_city: stateData.capital_city });
};

// GET state nickname
const getStateNickname = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  res.json({ nickname: stateData.nickname });
};

// GET state population
const getStatePopulation = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  res.json({ population: stateData.population });
};

// GET state admission date
const getStateAdmission = (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  res.json({ admission_date: stateData.admission_date });
};

// POST new fun facts for a state
const createFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  const funfacts = req.body.funfacts;
  if (!funfacts) {
    return res.status(400).json({ message: "State fun facts value required" });
  }
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ message: "State fun facts value must be an array" });
  }
  try {
    // Either update existing or create new document
    const stateDoc = await State.findOne({ stateCode: code });
    let updated;
    if (stateDoc) {
      // Append new fun facts to existing array
      stateDoc.funfacts.push(...funfacts);
      updated = await stateDoc.save();
    } else {
      // Create a new document for this state with funfacts
      updated = await State.create({ stateCode: code, funfacts: funfacts });
    }
    res.status(201).json(updated);  // return the updated document (including new funfacts)
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH update a specific fun fact (by index) for a state
const updateFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  const index = req.body.index;
  const newFact = req.body.funfact;
  if (index === undefined || newFact === undefined) {
    return res.status(400).json({ message: "State fun fact index and value are required" });
  }
  if (typeof index !== 'number') {
    return res.status(400).json({ message: "State fun fact index must be a number" });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state} to update` });
    }
    // index in request is 1-based, convert to 0-based
    const idx = index - 1;
    if (idx < 0 || idx >= stateDoc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    // Update the specific funfact
    stateDoc.funfacts[idx] = newFact;
    const updatedDoc = await stateDoc.save();
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE a specific fun fact (by index) for a state
const deleteFunFact = async (req, res) => {
  const code = req.params.state.toUpperCase();
  const stateData = getStateDataByCode(code);
  if (!stateData) {
    return res.status(404).json({ message: "State not found" });
  }
  const index = req.body.index;
  if (index === undefined) {
    return res.status(400).json({ message: "State fun fact index value required" });
  }
  if (typeof index !== 'number') {
    return res.status(400).json({ message: "State fun fact index must be a number" });
  }
  try {
    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
      return res.status(404).json({ message: `No Fun Facts found for ${stateData.state} to delete` });
    }
    const idx = index - 1;
    if (idx < 0 || idx >= stateDoc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }
    // Remove the funfact at the given index
    stateDoc.funfacts.splice(idx, 1);
    const updatedDoc = await stateDoc.save();
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
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
