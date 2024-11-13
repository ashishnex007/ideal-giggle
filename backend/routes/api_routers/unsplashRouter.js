const express = require('express');
const unsplashController = require('../../controllers/api_controllers/unsplashController');

const router = express.Router();

/*
    Documentation for Unsplash API: https://unsplash.com/documentation
    Guidelines for using the API: https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines
*/

router.get('/images', unsplashController.listImages);
router.get('/images/search', unsplashController.searchImages);
router.post('/images/incrementDownload', unsplashController.incrementDownload);

module.exports = router;