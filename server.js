// server.js
const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');
require('dotenv').config();

const statesRouter = require('./routes/statesRouter');
const app          = express();

// 1) Middleware + static + routes + 404
app.use(express.json());
app.use('/',       express.static(path.join(__dirname,'public')));
app.use('/states', statesRouter);
app.all('*', (req,res) => {
  if (req.accepts('html'))  return res.status(404).sendFile(path.join(__dirname,'public','404.html'));
  if (req.accepts('json'))  return res.status(404).json({ error: '404 Not Found' });
  return res.status(404).type('txt').send('404 Not Found');
});

// 2) Export the Express app for the test runner
module.exports = app;

// 3) Only connect & listen when run directly (node server.js)
if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/statesFunFacts';
  const PORT     = process.env.PORT     || 3000;

  mongoose.connect(MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Auto-seed the five required states if the collection is empty
    const State = require('./models/States');
    const count = await State.countDocuments();
    if (count === 0) {
      await State.insertMany([
        { stateCode:'KS', funfacts:[ /* your 3 facts */ ] },
        { stateCode:'MO', funfacts:[ /* … */ ] },
        { stateCode:'OK', funfacts:[ /* … */ ] },
        { stateCode:'NE', funfacts:[ /* … */ ] },
        { stateCode:'CO', funfacts:[ /* … */ ] }
      ]);
      console.log('Seeded initial funfacts');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
}
