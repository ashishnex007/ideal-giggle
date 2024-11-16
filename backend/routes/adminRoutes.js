const express = require('express');
const router = express.Router();
const {approveUser, suspendUser, resumeUser, createProjectManager, assignManager, assignOrUpdateManager} = require('../controllers/adminControllers.js');
const {protect} = require("../middlewares/authMiddleware.js");

router.route('/approveUser').post(protect, approveUser);
router.route('/suspendUser').post(protect, suspendUser);
router.route('/resumeUser').post(protect, resumeUser);
router.route('/createProjectManager').post(protect, createProjectManager);
router.route('/assignManager').post(protect, assignManager);
router.route('/updateManager').post(protect, assignOrUpdateManager);

module.exports = router;