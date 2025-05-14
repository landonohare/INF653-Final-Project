// seedFunFacts.js
require('dotenv').config();
const mongoose = require('mongoose');
const State = require('./models/States');

const seedData = [
  {
    stateCode: 'KS',
    funfacts: [
      'Wizard of Oz was set in Kansas',
      'Sunflower is the state flower',
      'Kansas produces more wheat than any other state'
    ]
  },
  {
    stateCode: 'MO',
    funfacts: [
      'The Pony Express started in Missouri',
      'Mark Twain was from Missouri',
      'Missouri is known as the Show-Me State'
    ]
  },
  {
    stateCode: 'OK',
    funfacts: [
      'Oklahoma hosted the first parking meter',
      'Home of Route 66',
      'Oklahoma means “red people”'
    ]
  },
  {
    stateCode: 'NE',
    funfacts: [
      'Nebraska’s state sport is sandhill crane watching',
      'Home of Kool-Aid',
      'Birthplace of the refrigerated railroad car'
    ]
  },
  {
    stateCode: 'CO',
    funfacts: [
      'The world’s first rodeo was in Colorado',
      'Colorado has the highest average elevation of any state',
      'Home to the world’s largest flat-top mountain'
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB, seeding fun facts…');

    // 1) Remove any existing docs in the `states` collection
    await State.deleteMany({});
    console.log('• Cleared existing fun facts');

    // 2) Insert all five required states in one go
    await State.insertMany(seedData);
    console.log('• Seed data inserted for KS, MO, OK, NE, CO');

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
