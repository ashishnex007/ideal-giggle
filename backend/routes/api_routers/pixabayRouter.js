const express = require('express');
const pixabayController = require('../../controllers/api_controllers/pixabayController');

router = express.Router();

/*
    Documentation for the Pixabay API: https://pixabay.com/api/docs/
*/

router.get('/images', pixabayController.getImages);
router.get('/videos', pixabayController.getVideos);

module.exports = router;