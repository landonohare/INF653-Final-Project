const express = require('express');
const router = express.Router();
const verifyState = require('../middleware/verifyState');
const ctrl = require('../controllers/statesController');

router.get('/',            ctrl.getAllStates);

// anything with :state needs verification first
router.get('/:state',      verifyState, ctrl.getState);
router.get('/:state/funfact', verifyState, ctrl.getRandomFunFact);
router.get('/:state/capital',  verifyState, ctrl.getStateCapital);
router.get('/:state/nickname', verifyState, ctrl.getStateNickname);
router.get('/:state/population', verifyState, ctrl.getStatePopulation);
router.get('/:state/admission',  verifyState, ctrl.getStateAdmission);

router.post('/:state/funfact',  verifyState, ctrl.createFunFact);
router.patch('/:state/funfact', verifyState, ctrl.updateFunFact);
router.delete('/:state/funfact',verifyState, ctrl.deleteFunFact);

module.exports = router;
