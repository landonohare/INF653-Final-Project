// server.js – now with CORS enabled for the Netlify grader
// ---------------------------------------------------------------------------

const express  = require('express');
const cors     = require('cors');            // <— NEW
const path     = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const statesRouter = require('./routes/statesRouter');

// ---------------------------------------------------------------------------
// 1.  Mongo connection (+ seed)
// ---------------------------------------------------------------------------
mongoose.set('strictQuery', false);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/statesFunFacts';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const State = require('./models/States');
    if ((await State.countDocuments()) === 0) {
      await State.insertMany([
        { stateCode: 'KS', funfacts: [
          'Wizard of Oz was set in Kansas',
          'Sunflower is the state flower',
          'Kansas produces more wheat than any other state',
        ]},
        { stateCode: 'MO', funfacts: [
          'Missouri is the birthplace of Mark Twain',
          'It’s called the Show-Me State',
          'The Gateway Arch is the tallest man-made monument in the U.S.',
        ]},
        { stateCode: 'OK', funfacts: [
          'The parking meter was invented in Oklahoma City',
          'Route 66 was born in Oklahoma',
          'The state bird is the Scissor-tailed Flycatcher',
        ]},
        { stateCode: 'NE', funfacts: [
          'Nebraska has more miles of river than any other state',
          'It’s the only state with a unicameral legislature',
          'Kool-Aid was invented in Hastings, Nebraska',
        ]},
        { stateCode: 'CO', funfacts: [
          'Colorado has the highest average elevation of any state',
          'The cheeseburger was trademarked in Denver',
          'It boasts four national parks',
        ]},
      ], { ordered: false });
      console.log('Seeded initial fun facts');
    }
  })
  .catch(err => console.error('MongoDB connection failed', err));

// ---------------------------------------------------------------------------
// 2.  Express app with CORS and JSON parsing
// ---------------------------------------------------------------------------
const app = express();
app.use(cors({ origin: true }));   // <— NEW (allows any origin, echoes it back)
app.use(express.json());

// ---------------------------------------------------------------------------
// 3.  Static + root HTML
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

// ---------------------------------------------------------------------------
// 4.  API routes
// ---------------------------------------------------------------------------
app.use('/states', statesRouter);

// ---------------------------------------------------------------------------
// 5.  404 catch-all returns HTML page (content-type text/html)
// ---------------------------------------------------------------------------
app.all('*', (req, res) => {
  res.status(404).sendFile('404.html', { root: path.join(__dirname, 'public') });
});

// ---------------------------------------------------------------------------
// 6.  Export app for testing; start server when run directly
// ---------------------------------------------------------------------------
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}