
const express = require('express');
const router  = express.Router();

const ctrl = require('../controllers/statesController');
const verifyState = require('../middleware/verifyState');


router.get('/', ctrl.getAllStates);


router.get('/:state', verifyState, ctrl.getState);


router.get('/:state/capital',    verifyState, ctrl.getStateCapital);
router.get('/:state/nickname',   verifyState, ctrl.getStateNickname);
router.get('/:state/population', verifyState, ctrl.getStatePopulation);
router.get('/:state/admission',  verifyState, ctrl.getStateAdmission);


router.route('/:state/funfact')
  .get(verifyState, ctrl.getRandomFunFact)
  .post(verifyState, ctrl.createFunFact)
  .patch(verifyState, ctrl.updateFunFact)
  .delete(verifyState, ctrl.deleteFunFact);

module.exports = router;
