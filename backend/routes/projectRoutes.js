const express = require('express');
const router = express.Router();

const { createProject, acceptProject, completeProject, rejectProject, viewProposal, sendProposal, acceptProposal, rejectProposal, unapprovedProjects, allProjects, allProposals, allPMProjects, allClientProjects, getProjectDetails, allFreelancerProjects } = require('../controllers/projectController');
const { searchSkills } = require('../controllers/PMControllers');
const { protect } = require('../middlewares/authMiddleware');

router.route('/create').post(protect, createProject);
router.route('/accept').post(protect, acceptProject);
router.route('/delete').delete(protect, rejectProject);
router.route('/complete').post(protect, completeProject);    

router.route('/unapproved').get(protect, unapprovedProjects);
router.route('/all-projects').get(protect, allProjects);
router.route('/all-pm-projects').get(protect, allPMProjects);
router.route('/all-client-projects').get(protect, allClientProjects);
router.route('/all-freelancer-projects').get(protect, allFreelancerProjects);

router.route('/send-proposal').post(protect, sendProposal);
router.route('/all-proposals').get(protect, allProposals);
router.route('/view-proposal').get(protect, viewProposal);
router.route('/accept-proposal').post(protect, acceptProposal);
router.route('/reject-proposal').post(protect, rejectProposal);
router.route('/get-project/:projectId').get(protect, getProjectDetails);

// PM operations
router.route('/search').post(protect, searchSkills);

module.exports = router;