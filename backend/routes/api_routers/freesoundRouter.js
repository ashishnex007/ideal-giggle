const express = require('express');
const freesoundController = require('../../controllers/api_controllers/freesoundController');

const router = express.Router();

router.get('/sounds', freesoundController.getSounds);
router.get('/sounds/:id/download', freesoundController.downloadSound);

module.exports = router;