const express = require('express');
const removebgController = require('../../controllers/api_controllers/removebgController');

const router = express.Router();

/*
    Documentation for remove.bg API: https://www.remove.bg/api
    npm package for remove.bg API: https://www.npmjs.com/package/remove.bg
*/

router.post('/', removebgController.removeBackground);

module.exports = router;