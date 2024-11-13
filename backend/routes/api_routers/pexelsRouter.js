const express = require('express');
const pexelsController = require('../../controllers/api_controllers/pexelsController');

const router = express.Router();

/*
    Documentation for Pexels API: https://www.pexels.com/api/documentation/
    Guidelines:

    ! Show "Photos from Pexels" on the page where the photo is displayed.
    ! Credit the photographer and Pexels. "Photo by John Doe on Pexels"

*/

router.get('/images', pexelsController.getImages);
router.get('/images/:id', pexelsController.getImage);
router.get('/videos', pexelsController.getVideos);
router.get('/popular-videos', pexelsController.getPopularVideos);
router.get('/videos/:id', pexelsController.getVideo);

module.exports = router;