const express = require("express");
const router = express.Router();
const { homeUser, registerUser, authUser, fetchUsers, verifyUserEmail, resendEmailVerification, deleteUser, forgotPassword, resetPassword, onboardClient, onboardFreelancer,onboardProjectManager, getClients, getFreelancers, updateManager, getFreelancerDetails, getClientDetails, checkEmailExists, checkUIDExists, viewProfile, editProfile, googleLogin,googleSignup,downloadInfo, getUserDetails } = require("../controllers/userControllers.js");

const { protect } = require("../middlewares/authMiddleware");

router.route("/").get(homeUser);
router.route("/google-login").post(googleLogin);
router.route("/google-signup").post(googleSignup);
router.route("/register").post(protect, registerUser);
router.route("/register/client").post(protect, onboardClient);
router.route("/register/freelancer").post(protect, onboardFreelancer);
router.route("/login").post(authUser);
router.route("/auth/forgot-password").post(forgotPassword);
router.route("/auth/reset-password/:token").post(resetPassword);
router.route('/delete/:id').delete(protect, deleteUser);
router.route("/check-email").post(checkEmailExists);
router.route("/check-uid").post(checkUIDExists);
router.route("/users").get(protect, fetchUsers);
router.route("/clients").get(getClients);
router.route("/freelancers").get(getFreelancers);
router.route("/download-info").post(protect,downloadInfo);
router.route("/user/:userId").get(protect, getUserDetails);
router.route("/freelancer/:userId").get(protect, getFreelancerDetails);
router.route("/client/:userId").get(protect, getClientDetails);
router.route("/auth/verify/resend").post(protect, resendEmailVerification);
router.route("/auth/verify/:token").get(verifyUserEmail);

router.route("/viewProfile/:userId").post(protect, viewProfile);
router.route("/editProfile/:userId").post(protect,editProfile);

module.exports = router;

/*
    Before registering a user, the validateAdmin middleware is used to check if the user is an admin. 
    If the user is an admin, the user is allowed to register an admin or project manager.
    If the user is not an admin, the user is not allowed to register.

    Non admin users are allowed to be registered as client / freelancer.

    The protect middleware is used to check if the user is logged in or not.
    logged in -> req.user = user object
    not logged in -> req.user = undefined
*/
