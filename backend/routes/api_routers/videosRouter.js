const express = require('express');
const Router = express.Router();

const videosController = require('../../controllers/api_controllers/videosController');

Router.get('/', videosController.getVideos);

module.exports = Router;