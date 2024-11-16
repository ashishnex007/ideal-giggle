const express = require('express');
const Router = express.Router();

const imagesController = require('../../controllers/api_controllers/imagesController');

Router.get('/', imagesController.getImages);

module.exports = Router;