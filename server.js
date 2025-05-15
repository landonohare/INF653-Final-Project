// server.js
const express  = require('express');
const path     = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const statesRouter = require('./routes/statesRouter');

const app = express();

/* ---------- 1.  root HTML page ---------- */
app.get('/', (req, res, next) => {
  // if client only wants JSON, say we can’t do that
  if (req.accepts('html') === false) {
    return res.status(406).json({ error: 'Not Acceptable' });
  }
  next();               // go on to the real root handler
});

app.get('/', (req, res) =>
  res
    .status(200)
    .type('html')
    .sendFile(path.join(__dirname, 'public', 'index.html'))
);

/* ---------- 2.  JSON body parsing ---------- */
app.use(express.json());

/* ---------- 3.  API routes ---------- */
app.use('/states', statesRouter);

/* ---------- 4.  static assets ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- 5.  404 catch-all ---------- */
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, 'public', '404.html'));
  }
  if (req.accepts('json')) {
    return res.status(404).json({ error: '404 Not Found' });
  }
  return res.status(404).type('txt').send('404 Not Found');
});

/* ---------- 6.  export for the test runner ---------- */
module.exports = app;

/* ---------- 7.  run the server only when invoked directly ---------- */
if (require.main === module) {
  mongoose.set('strictQuery', true);
  const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/statesFunFacts';

  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log('Connected to MongoDB');

      /* ----- auto-seed the five required states once ----- */
      const State = require('./models/States');
      if ((await State.countDocuments()) === 0) {
        await State.insertMany([
          {
            stateCode: 'KS',
            funfacts: [
              'Wizard of Oz was set in Kansas',
              'Sunflower is the state flower',
              'Kansas produces more wheat than any other state',
            ],
          },
          {
            stateCode: 'MO',
            funfacts: [
              'Missouri is the birthplace of Mark Twain',
              'It’s called the Show-Me State',
              'The Gateway Arch is the tallest man-made monument in the U.S.',
            ],
          },
          {
            stateCode: 'OK',
            funfacts: [
              'The parking meter was invented in Oklahoma City',
              'Route 66 was born in Oklahoma',
              'The state bird is the Scissor-tailed Flycatcher',
            ],
          },
          {
            stateCode: 'NE',
            funfacts: [
              'Nebraska has more miles of river than any other state',
              'It’s the only state with a unicameral legislature',
              'Kool-Aid was invented in Hastings, Nebraska',
            ],
          },
          {
            stateCode: 'CO',
            funfacts: [
              'Colorado has the highest average elevation of any state',
              'The cheeseburger was trademarked in Denver',
              'It boasts four national parks',
            ],
          },
        ]);
        console.log('Seeded initial fun facts');
      }

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () =>
        console.log(`Server listening on port ${PORT}`)
      );
    })
    .catch((err) => {
      console.error('MongoDB connection failed', err);
      process.exit(1);
    });
}
