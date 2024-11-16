const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { Parser } = require('json2csv');
const { User } = require("../models/userModel");
const Client = require("../models/clientModel");
const Freelancer = require("../models/freelancerModel");
const ProjectManager = require("../models/projectManagerModel.js");
const generateToken = require("../utils/jwt");
const {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emails");

function generateRandomPassword() {
  return crypto.randomBytes(10).toString('hex'); // Generates a 12 character random string
}

const homeUser = asyncHandler(async (req, res) => {
  res.send("User Api is running");
});

const checkEmailExists = async(req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email: email});
  if(user){
    return res.status(400).json({message: "Email already exists"});
  }else{
    return res.status(200).json({message: "Email is available"});
  }
};

const checkUIDExists = async(req, res) => {
  const {UID} = req.body;
  const user = await User.findOne({UID:UID});
  if(user){
    return res.status(400).json({message: "UID already exists"});
  }else{
    return res.status(200).json({message: "UID is available"});
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { UID, name, email, password, role } = req.body;
  const { user } = req;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    // Check if role to be created is admin or project manager and user is admin

    /*
        Ideally while registering only no user should be logged in except admin.
        So if user is logged in and trying to register a user, then it should be checked if the user is admin.
        If the user is admin, then the user can register an admin or project manager.
        If the user is not an admin, then the user is not allowed to register when logged in.
    */

    if (
      user &&
      user.role !== "admin" &&
      (role === "admin" || role === "project manager")
    ) {
      return res.status(401).json({ error: "Not an authorized admin" });
    }

    if (user && user.role !== "admin") {
      return res.status(401).json({ error: "No registering when logged in" });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email address already exists" });
    }

    // Creating the user
    const verificationToken = generateVerificationToken();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sending the verification email // ! commented for now
    // await sendVerificationEmail(email, verificationToken);

    const newUser = await User.create({
      UID,
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
    });

    // Respond with the created user data
    res.status(201).json({
      _id: newUser._id,
      UID: newUser.UID,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function verifyGoogleToken(credential) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload; // Returns user's profile info: email, name, picture, etc.
};

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify Google token
    const profile = await verifyGoogleToken(credential);

    // Check if the user already exists in the database
    let user = await User.findOne({ email: profile.email });

    if(!user){
      return res.status(404).json({error: "User not found"});
    }

    // Generate token
    const token = generateToken(user._id);

    // Respond with user data
    res.status(200).json({
      _id: user._id,
      UID: user.UID,
      name: user.name,
      email: user.email,
      role: user.role,
      active_projects: user.active_projects,
      total_projects: user.total_projects,
      token: token,
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const googleSignup = asyncHandler(async (req, res) => {
  const { credential, role, UID } = req.body;

  try {
    // Verify Google token
    const profile = await verifyGoogleToken(credential);

    // Check if the user already exists in the database
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // If the user doesn't exist, create a new user with a random password
      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new User({
        UID: UID, // Google UID
        name: profile.name,
        email: profile.email,
        password: hashedPassword, // Random password to satisfy schema
        role, 
      });

      user = await newUser.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Respond with user data
    res.status(200).json({
      _id: user._id,
      UID: user.UID,
      name: user.name,
      email: user.email,
      role: user.role,
      active_projects: user.active_projects,
      total_projects: user.total_projects,
      token: token,
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// * onboarding APIs
// onboard client
const onboardClient = asyncHandler(async (req, res) => {
  const { userId, description, requirements, skillset, domains, phoneNumber, address, portfolios, businesses} = req.body;

  if(!userId || !description || !requirements || !skillset || !phoneNumber || !address) {
    res.status(400).json({message: "Please fill all the fields"});
  }
  try {
    const user = await User.findById(userId);
    if(!user){
      res.status(404).json({message: "User not found"});
    }

    if(user.role !== "client"){
      res.status(401).json({message: "User is not a client"});
    }

    const existingClient = await Client.findOne({ userId });

    if (existingClient) {
        return res.status(400).json({ message: 'Client already exists' });
    }

    const newClient = new Client({
      userId,
      description,
      requirements,
      skillset,
      domains,
      phoneNumber,
      address,
      portfolios,
      businesses,
    });

    await newClient.save();
    res.status(200).json({message:"Client onboarded successfully"});

  } catch (error) {
    console.error("Error onboarding client:", error);
    res.send(500).json({message: "Internal Server Error", error: error.message});
  }
});

// * onboard freelancer
const onboardFreelancer = asyncHandler(async(req, res) => {
  const {userId, bio, education, experience, portfolios, servicesList, skills, languages, phoneNumber, address} = req.body;

  if(!userId || !education || !portfolios || !servicesList || !skills || !languages || !phoneNumber || !address){
    res.status(400).json({message: "Please fill all the fields"});
  }
  
  try {
    const user = await User.findById(userId);
    if(!user){
      res.status(404).json({message: "User not found"});
    }

    if(user.role !== "freelancer"){
      res.status(401).json({message: "User is not a freelancer"});
    }

    // check if freelancer already exists
    const existingFreelancer = await Freelancer.findOne({userId});
    if(existingFreelancer){
      res.status(400).json({message: "Freelancer already exists"});
    }

    // create new one
    const newFreelancer = new Freelancer({
      userId,
      bio,
      education,
      experience,
      portfolios,
      servicesList,
      skills,
      languages,
      phoneNumber,
      address,
    });
    await newFreelancer.save();
    res.status(200).json({message: "Freelancer onboarded successfully"});
  } catch (error) {
    res.status(500).json({message: "Internal Server Error", error: error.message});
  }
});

const viewProfile = asyncHandler(async(req, res) => {

  const {userId} = req.params;

  if(req.user.role !== "admin" && req.user.role !== "project manager"){
    return res.status(401).json({message: "Not an authorized user" });
  };

  const user = await User.findById(userId).select("-password -__v -verificationToken -resetToken");

  if(!user){
    return res.status(404).json({message: "User not found"});
  }

  if (req.user.role === "project manager" && user.role !== "freelancer") {
    return res.status(403).json({ message: "Project managers can only view freelancer profiles" });
  }

  if(user.role === "client"){
    const client = await Client.find({userId: userId}).select("-__v");
    return res.status(200).json({user, client});
  }else if(user.role === "freelancer"){
    const freelancer = await Freelancer.find({userId: userId});
    return res.status(200).json({user, freelancer});
  }else if(user.role === "project manager"){
    const projectManager = await ProjectManager.find({userId: userId});
    return res.status(200).json({user, projectManager});
  }else{
    return res.status(200).json(user);
  };

});

const editProfile = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio } = req.body;

    if (!["client", "freelancer"].includes(req.user.role)) {
      return res.status(401).json({ message: "Not an authorized user" });
    }

    const user = await User.findById(userId).select("-password -__v -verificationToken -resetToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) user.name = name;
    await user.save();

    const profileModel = user.role === "client" ? Client : Freelancer;
    const profile = await profileModel.findOne({ userId }).select("-__v");

    if (!profile) return res.status(404).json({ message: `${user.role} profile not found` });
    if (bio && user.role === "client") profile.description = bio;
    else if(bio) profile.bio = bio;
    await profile.save();

    return res.status(200).json({ user, [user.role]: profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // if user is null then user is not logged in to get verification email
  if (!req.user) {
    return res.status(401).send("Not Authorized");
  }
  
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ error: "User already verified" });
    }

    const verificationToken = generateVerificationToken();
    await sendVerificationEmail(email, verificationToken);

    user.verificationToken = verificationToken;
    await user.save();

    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({ verificationToken: token });

    // no user with that token
    if (!user) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);

    // Respond with everything except the password
    res.json({
      _id: user._id,
      UID: user.UID,
      name: user.name,
      email: user.email,
      role: user.role,
      active_projects: user.active_projects,
      total_projects: user.total_projects,
      token: token,
      verified: user.verified,
    });
  } else {
    return res.status(401).send("Invalid email or password");
  }
});

const fetchUsers = asyncHandler(async (req, res) => {
  // if logged in user is an admin;
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: "Not an authorized user" });
  }

  if (user.role == "admin") {
    const users = await User.find({}, "-password");
    return res.json(users);
  } else if (user.role == "project manager") {
     const users = await User.find(
      { role: { $in: ["client", "freelancer"] } },
      "-password"
    );
    return res.json(users);
  } else if(user.role == "client" || user.role == "freelancer"){
      const users = await User.find(
        { role: "project manager"},
        "-password"
      );
      return res.json(users);
  } else {
    return res.status(401).json({ error: "Not an authorized user" });
  }

    /*
        if the one who is logged in is an admin, then all the users are fetched.
        if the one who is logged in is a project manager, then only clients and freelancers are fetched.
        if the one who is logged in is a client or freelancer, then the user is not authorized to fetch users.
    */
});

// * user details + client particulars
const getClients = asyncHandler(async(req, res) => {
  const clients = await User.aggregate([
    {
      $match: { role: "client" }
    },
    {
      $lookup: {
        from: "clients", 
        localField: "_id",
        foreignField: "userId",
        as: "clientDetails"
      }
    },
    {
      $unwind: {
        path: "$clientDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        active_projects: 1,
        total_projects: 1,
        "clientDetails.description": 1,
        "clientDetails.requirements": 1,
        "clientDetails.skillset": 1,
        "clientDetails.credits": 1,
      }
    }
  ]);
  res.status(200).json(clients);
});

// * user details + freelancer particulars
const getFreelancers = asyncHandler(async(req, res) => {
  const freelancers = await User.aggregate([
    {
      $match: { role: "freelancer" }
    },
    {
      $lookup: {
        from: "freelancers", 
        localField: "_id",
        foreignField: "userId",
        as: "freelancerDetails"
      }
    },
    {
      $unwind: {
        path: "$freelancerDetails",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        active_projects: 1,
        total_projects: 1,
        "freelancerDetails.bio": 1,
        "freelancerDetails.hourlyRate": 1,
        "freelancerDetails.education": 1,
        "freelancerDetails.experience": 1,
        "freelancerDetails.portfolios": 1,
        "freelancerDetails.servicesList": 1,
        "freelancerDetails.skills": 1,
        "freelancerDetails.languages": 1,
      }
    }
  ]);
  res.status(200).json(freelancers);
});

const getUserDetails = asyncHandler(async(req, res) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

const getFreelancerDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // First, check if the user exists
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log(`User not found for userId: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Now, fetch freelancer details from the Freelancer collection
    const freelancer = await Freelancer.findOne({ userId: userId });

    if (!freelancer) {
      console.log(`Freelancer details not found for userId: ${userId}`);
    }

    res.status(200).json(freelancer);
  } catch (error) {
    console.error("Error fetching freelancer details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

const getClientDetails = async(req, res) => {
  const {userId} = req.params;
  
  try {
    // First, check if the user exists
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log(`User not found for userId: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Now, fetch client details from the client collection
    const client = await Client.findOne({ userId: userId });

    if (!client) {
      console.log(`client details not found for userId: ${userId}`);
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const downloadInfo = asyncHandler(async (req, res) => {
  const { user } = req;
  if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Not an authorized user' });
  }

  const { roles } = req.body; // Expecting roles in the request body
  if (!roles) {
      return res.status(400).json({ message: 'Roles are required' });
  }

  const roleList = roles.split(',');

  let csvData = '';

  try {
      for (const role of roleList) {
          // Fetch users with the specified role
          const users = await User.find({ role: role.trim() }).select('-password -__v -verificationToken -resetToken');
          let data = []; // To hold merged user and role-specific data
          let fields = []; // CSV fields

          if (role.trim() === 'client') {
              // Fetch role-specific data for clients
              for (const userItem of users) {
                  const clientData = await Client.findOne({ userId: userItem._id }).lean();
                  if (clientData) {
                      data.push({
                          ...userItem.toObject(),
                          ...clientData,
                      });
                  }
              }
              // Define fields based on User and Client schemas
              fields = [
                  'name',
                  'email',
                  'role',
                  'description',
                  'requirements',
                  'skillset',
                  'domains',
                  'phoneNumber',
                  'address',
                  'portfolios',
                  'businesses',
                  'GSTInvoice',
                  'credits',
                  'manager',
                  'total_projects',
                  "verified",
                  'adminVerified',
                  'isSuspended',

              ];
          } else if (role.trim() === 'freelancer') {
              // Fetch role-specific data for freelancers
              for (const userItem of users) {
                  const freelancerData = await Freelancer.findOne({ userId: userItem._id }).lean();
                  if (freelancerData) {
                      data.push({
                          ...userItem.toObject(),
                          ...freelancerData,
                      });
                  }
              }
              // Define fields based on User and Freelancer schemas
              fields = [
                  'name',
                  'email',
                  'role',
                  'bio',
                  'education',
                  'experience',
                  'portfolios',
                  'servicesList',
                  'skills',
                  'languages',
                  'credits',
                  'phoneNumber',
                  'address',
                  'total_projects',
                  "verified",
                  'adminVerified',
                  'isSuspended',
              ];
          } else if (role.trim() === 'project manager') {
              // Fetch role-specific data for project managers
              for (const userItem of users) {
                  const pmData = await ProjectManager.findOne({ userId: userItem._id }).lean();
                  if (pmData) {
                      data.push({
                          ...userItem.toObject(),
                          ...pmData,
                      });
                  }
              }
              // Define fields based on User and ProjectManager schemas
              fields = [
                  'name',
                  'email',
                  'role',
                  'phoneNumber',
                  'address',
                  'languages',
                  'domains',
                  'clients',
                  'total_projects',
                  "verified",
                  'adminVerified',
                  'isSuspended',
              ];
          }
          // if some role is added then
          //  else {
          //     // For other roles, include User data only
          //     data = users.map((userItem) => userItem.toObject());
          //     fields = [
          //         'name',
          //         'email',
          //         'role',
          //         'active_projects',
          //         'total_projects',
          //         'verified',
          //         'adminVerified',
          //         'isSuspended',
          //     ];
          // }

          if (data.length > 0) {
              // Convert data to CSV
              const json2csvParser = new Parser({ fields });
              const csv = json2csvParser.parse(data);
              // Add section heading and blank lines for separation
              csvData += `${role.trim().charAt(0).toUpperCase() + role.trim().slice(1)} Data\n${csv}\n\n`;
          }
      }
      // Send the CSV file as a response
      res.header('Content-Type', 'text/csv');
      res.attachment('data.csv');
      res.send(csvData);
  } catch (error) {
      console.error('Error generating CSV:', error);
      res.status(500).json({ message: 'Error generating CSV' });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = generateVerificationToken();
    user.resetToken = resetToken;
    await user.save();

    // send email with reset token
    sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({ message: "Reset password email sent successfully" });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const {password } = req.body;

  console.log(token, password);

  try {
    const user = await User.findOne ({ resetToken: token });
    if (!user) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({ error: "Not an authorized admin" });
  }

  if (user.role == "admin") {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      return res.json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } else {
    return res.status(401).json({ error: "Not an authorized user" });
  }
});

module.exports = {
  homeUser,
  registerUser,
  authUser,
  googleSignup,
  googleLogin,
  fetchUsers,
  verifyUserEmail,
  checkEmailExists,
  checkUIDExists,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  deleteUser,
  onboardClient,
  onboardFreelancer,
  getClients,
  getFreelancers,
  getUserDetails,
  getFreelancerDetails,
  getClientDetails,
  viewProfile,
  editProfile,
  downloadInfo
};