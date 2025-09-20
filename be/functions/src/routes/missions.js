const express = require('express');
const missionController = require('../controllers/missionController');

const router = express.Router();

router.post('/users/:userId/missions', missionController.createMission);
router.get('/users/:userId/missions', missionController.getUserMissions);
router.get('/users/:userId/missions/:missionId', missionController.getMissionById);
router.put('/users/:userId/missions/:missionId', missionController.updateMission);
router.delete('/users/:userId/missions/:missionId', missionController.deleteMission);

module.exports = router;