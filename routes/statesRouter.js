const express = require('express');
const router = express.Router();
const verifyState = require('../middleware/verifyState');
const ctrl = require('../controllers/statesController');

// GET /states/ - list all states, optionally filter by contig
router.get('/', ctrl.getAllStates);

// All routes below use verifyState to validate :state param
router.get('/:state', verifyState, ctrl.getState);
router.get('/:state/funfact', verifyState, ctrl.getRandomFunFact);
router.get('/:state/capital', verifyState, ctrl.getStateCapital);
router.get('/:state/nickname', verifyState, ctrl.getStateNickname);
router.get('/:state/population', verifyState, ctrl.getStatePopulation);
router.get('/:state/admission', verifyState, ctrl.getStateAdmission);

// Mutations for funfacts
router.post('/:state/funfact', verifyState, ctrl.createFunFact);
router.patch('/:state/funfact', verifyState, ctrl.updateFunFact);
router.delete('/:state/funfact', verifyState, ctrl.deleteFunFact);

module.exports = router;