const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const statesRouter = require('./routes/statesRouter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve the root HTML page and other static files from /public
app.use('/', express.static(path.join(__dirname, 'public')));

// Use the states router for all /states API routes
app.use('/states', statesRouter);

// Catch-all for 404 errors (routes not handled above)
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    // Serve 404 page as HTML
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    // JSON response for API clients
    res.status(404).json({ error: "404 Not Found" });
  } else {
    // Plain text fallback
    res.status(404).type('txt').send('404 Not Found');
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
