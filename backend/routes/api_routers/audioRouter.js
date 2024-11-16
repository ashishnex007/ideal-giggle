const audioController = require('../../controllers/api_controllers/audioController');
const express = require('express');
const router = express.Router();

router.get('/', audioController.getAudios);

module.exports = router;