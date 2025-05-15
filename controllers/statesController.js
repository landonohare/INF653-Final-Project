// controllers/statesController.js
// Business logic for each US States API endpoint.
// ---------------------------------------------------------------------------

const State      = require('../models/States');
const statesData = require('../models/statesData.json');

// Helper: map of raw state data keyed by code
const statesMap = statesData.reduce((m, st)=>{ m[st.code] = st; return m; }, {});

// ---------------------------------------------------------------------------
// GET /states  (optionally ?contig=true|false)
// ---------------------------------------------------------------------------
exports.getAllStates = async (req, res) => {
  try {
    // 1) base set — apply contig filter if requested
    const contig = req.query.contig;
    let base = statesData;
    if (contig === 'true')   base = statesData.filter(st => !['AK','HI'].includes(st.code));
    if (contig === 'false')  base = statesData.filter(st =>  ['AK','HI'].includes(st.code));

    // 2) fetch funfacts from Mongo once
    const docs = await State.find({});
    const funMap = docs.reduce((map, d)=>{ map[d.stateCode] = d.funfacts; return map; },{});

    // 3) merge & send
    const merged = base.map(st => funMap[st.code] ? { ...st, funfacts: funMap[st.code] } : st);
    res.json(merged);
  }
  catch(err){
    console.error('getAllStates error:', err);
    res.status(500).json({ error:'Internal server error' });
  }
};

// ---------------------------------------------------------------------------
// Shared utility to attach merged record (via verifyState)
// ---------------------------------------------------------------------------
function mergedRecord(stateCode, stateDoc){
  const raw = { ...statesMap[stateCode] };
  if(stateDoc?.funfacts?.length) raw.funfacts = stateDoc.funfacts;
  return raw;
}

// ---------------------------------------------------------------------------
// GET /states/:state
// ---------------------------------------------------------------------------
exports.getState = async (req,res)=>{
  try{
    const doc = await State.findOne({ stateCode: req.stateCode });
    res.json( mergedRecord(req.stateCode, doc) );
  }catch(err){
    console.error('getState error:', err);
    res.status(500).json({ error:'Internal server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /states/:state/funfact (random)
// ---------------------------------------------------------------------------
exports.getRandomFunFact = async (req,res)=>{
  const raw = statesMap[req.stateCode];
  const doc = await State.findOne({ stateCode:req.stateCode });
  if(!doc?.funfacts?.length){
    return res.status(404).json({ message: `No Fun Facts found for ${raw.state}` });
  }
  const fact = doc.funfacts[ Math.floor(Math.random()*doc.funfacts.length) ];
  res.json({ funfact: fact });
};

// ---------------------------------------------------------------------------
// Single-property helpers (capital, nickname, population, admission)
// ---------------------------------------------------------------------------
const propHelper = (prop, outKey)=> (req,res)=>{
  const raw = statesMap[req.stateCode];
  let val = raw[prop];
  if(prop==='population') val = val.toLocaleString('en-US');
  res.json({ state: raw.state, [outKey]: val });
};

exports.getStateCapital    = propHelper('capital_city',    'capital');
exports.getStateNickname   = propHelper('nickname',        'nickname');
exports.getStatePopulation = propHelper('population',      'population');
exports.getStateAdmission  = propHelper('admission_date',  'admitted');

// ---------------------------------------------------------------------------
// POST /states/:state/funfact (append)
// ---------------------------------------------------------------------------
exports.createFunFact = async (req,res)=>{
  const funfacts = req.body.funfacts;
  if(!funfacts)                return res.status(400).json({ message:'State fun facts value required' });
  if(!Array.isArray(funfacts)) return res.status(400).json({ message:'State fun facts value must be an array' });

  let doc = await State.findOne({ stateCode:req.stateCode });
  if(doc){ doc.funfacts.push(...funfacts); }
  else   { doc = new State({ stateCode:req.stateCode, funfacts }); }
  await doc.save();
  res.status(201).json( mergedRecord(req.stateCode, doc) );
};

// ---------------------------------------------------------------------------
// PATCH /states/:state/funfact
// ---------------------------------------------------------------------------
exports.updateFunFact = async (req,res)=>{
  const { index, funfact } = req.body;
  if(index==null)            return res.status(400).json({ message:'State fun fact index value required' });
  if(typeof funfact!=='string') return res.status(400).json({ message:'State fun fact value required' });

  const doc = await State.findOne({ stateCode:req.stateCode });
  const raw = statesMap[req.stateCode];
  if(!doc?.funfacts?.length)  return res.status(404).json({ message:`No Fun Facts found for ${raw.state}` });

  const idx = index-1;
  if(idx<0 || idx>=doc.funfacts.length) return res.status(404).json({ message:`No Fun Fact found at that index for ${raw.state}` });
  doc.funfacts[idx]=funfact;
  await doc.save();
  res.json( mergedRecord(req.stateCode, doc) );
};

// ---------------------------------------------------------------------------
// DELETE /states/:state/funfact
// ---------------------------------------------------------------------------
exports.deleteFunFact = async (req,res)=>{
  const { index } = req.body;
  if(index==null) return res.status(400).json({ message:'State fun fact index value required' });
  const doc = await State.findOne({ stateCode:req.stateCode });
  const raw = statesMap[req.stateCode];
  if(!doc?.funfacts?.length) return res.status(404).json({ message:`No Fun Facts found for ${raw.state}` });
  const idx=index-1;
  if(idx<0||idx>=doc.funfacts.length) return res.status(404).json({ message:`No Fun Fact found at that index for ${raw.state}` });
  doc.funfacts.splice(idx,1);
  await doc.save();
  res.json( mergedRecord(req.stateCode, doc) );
};