const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');

// GET routes for state data
router.get('/', statesController.getAllStates);
router.get('/:state', statesController.getState);
router.get('/:state/funfact', statesController.getRandomFunFact);
router.get('/:state/capital', statesController.getStateCapital);
router.get('/:state/nickname', statesController.getStateNickname);
router.get('/:state/population', statesController.getStatePopulation);
router.get('/:state/admission', statesController.getStateAdmission);

// POST route to add new fun facts
router.post('/:state/funfact', statesController.createFunFact);

// PATCH route to update an existing fun fact
router.patch('/:state/funfact', statesController.updateFunFact);

// DELETE route to remove a fun fact
router.delete('/:state/funfact', statesController.deleteFunFact);

module.exports = router;
