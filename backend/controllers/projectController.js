const Project = require("../models/projectModel");
const Client = require("../models/clientModel");
const Proposal = require("../models/proposalModel");
const Chat = require("../models/chatModel");
const {User} = require("../models/userModel");
const ProjectManager = require("../models/projectManagerModel");
const asyncHandler = require("express-async-handler");

// * Create a new project (by Client)
const createProject = asyncHandler(async(req, res) => {
    const {title, description, skills, budget, deadline} = req.body;

    if(!title || !description || !skills || !budget || !deadline){
        return res.status(400).json({message: "Please fill all the fields"});
    }

    if(req.user.role !== "client"){
        return res.status(400).json({message: "Only clients can create projects"});
    }

    // find the client using the user ID
    const client = await Client.findOne({userId: req.user._id});
    console.log(client)
    if(!client){
        return res.status(400).json({message: "Client not found"});
    }
    
    // check if the client has enough credits
    if(client.credits < budget){
        return res.status(400).json({message: "Insufficient credits"});
    }

    const project = new Project({
        title,
        description,
        skills,
        budget,
        deadline,
        client: req.user._id,
        clientName: req.user.name
    });

    await project.save();
    
    res.status(200).json({message: "Project created successfully"});
});

// * view all the unapproved projects (by PM)
const unapprovedProjects = asyncHandler(async(req, res) => {
    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can view unapproved projects"});
    }

    const pm = await ProjectManager.findOne({userId: req.user._id});

    console.log(pm);

    if(!pm){
        return res.status(400).json({message: "Project Manager not found"});
    }

    const projects = await Project.find({
        status: "unapproved",
        client: {$in: pm.clients}
    }).select('_id title description skills budget deadline client clientName');
    
    res.status(200).json({projects});
});

// * view all the projects (by PM)
const allProjects = asyncHandler(async(req, res) => {
    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can view projects"});
    }
    const projects = await Project.find({}).select('-__v');
    res.status(200).json({projects});
}); 

// * view all the projects assigned PM
const allPMProjects = asyncHandler(async(req, res) => {
    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can view projects"});
    }
    // Find projects where the user_id is in the assignedManager field
    const projects = await Project.find({assignedManager: req.user._id}).select('-__v');
    res.status(200).json({projects});
});

// * view all the client projects
const allClientProjects = asyncHandler(async(req, res) => {
    if(req.user.role !== "client"){
        return res.status(400).json({message: "Only clients can view projects"});
    }
    const projects = await Project.find({client: req.user._id}).select('-__v');
    res.status(200).json({projects});
});

// * view all the freelancer projects
const allFreelancerProjects = asyncHandler(async(req, res) => {
    if(req.user.role !== "freelancer"){
        return res.status(400).json({message: "Only freelancers can view projects"});
    }
    const projects = await Project.find({"freelancers.freelancer": req.user._id}).select('-__v');
    res.status(200).json({projects});
});

// * accept the project (by PM)
const acceptProject = asyncHandler(async(req, res) => {
    const {projectId} = req.body;

    if(!projectId){
        return res.status(400).json({message: "Please provide a project ID"});
    }

    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can validate projects"});
    }
    
    const project = await Project.findById(projectId);

    if(!project){
        return res.status(400).json({message: "Project not found"});
    }

    if(project.status !== "unapproved"){
        return res.status(400).json({message: "Project already accepted"});
    }
    
    try {
        // Add the project to the active_projects of both client and project manager
        await User.updateOne(
            { _id: project.client },
            { $addToSet: { active_projects: projectId } }
        );
    
        await User.updateOne(
            { _id: req.user._id },
            { $addToSet: { active_projects: projectId } }
        );
    
        project.status = "open";
        project.assignedManager = req.user._id;
        await project.save();
    } catch (error) {
        console.error("Error accepting project:", error);
    }
    res.status(200).json({message: "Project accepted and now is open"});
});

// * reject the project (by PM)
const rejectProject = asyncHandler(async(req, res) => {
    const {projectId} = req.body;

    if(!projectId){
        return res.status(400).json({message: "Please provide a project ID"});
    }

    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can validate projects"});
    }
    
    const project = await Project.findOne({_id: projectId});

    if(!project){
        return res.status(400).json({message: "Project not found"});
    }

    project.status = "rejected";

    res.status(200).json({message: `${project.title} Project rejected`});
});

// * completion of the project (by PM or the admin of the project)
const completeProject = asyncHandler(async(req, res) => {
    const {projectId} = req.body;

    if(!projectId){
        return res.send(400).json({message: "Please provide a project ID"});
    }

    const project = await Project.findOne({_id: projectId});

    if(!project){
        return res.send(400).json({message: "Project not found"});
    }

    if(project.status === "unapproved"){
        return res.status(400).json({message: "Cannot complete a project which is not accepted yet"});
    }

    if(project.status === "completed"){
        return res.status(400).json({message: "Project already completed"});
    }

    try {
        // Update the project status to completed
        project.status = "completed";

        // Remove the project from active_projects and increment total_projects for the client
        await User.updateOne(
            { _id: project.client },
            {
                $pull: { active_projects: projectId },
                $inc: { total_projects: 1 }
            }
        );

        // Remove the project from active_projects and increment total_projects for the project manager
        if (project.assignedManager) {
            await User.updateOne(
                { _id: project.assignedManager },
                {
                    $pull: { active_projects: projectId },
                    $inc: { total_projects: 1 }
                }
            );
        }

        // Remove the project from active_projects and increment total_projects for each freelancer
        const freelancerUpdates = project.freelancers.map(freelancer => {
            return User.updateOne(
                { _id: freelancer.freelancer },
                {
                    $pull: { active_projects: projectId },
                    $inc: { total_projects: 1 }
                }
            );
        });

        await Promise.all(freelancerUpdates);

        // Save the updated project status
        await project.save();

        res.status(200).json({ message: "Project marked as completed" });
    } catch (error) {
        console.error("Error completing project:", error);
        res.status(500).json({ message: "Error completing project", error });
    }
});

// * send project proposal to freelancer (by PM)
const sendProposal = asyncHandler(async(req, res) => {
    // * freelancer ID refers to the userId of the freelancer
    const {projectName, projectId, freelancerId, description, deadline, projectRole} = req.body;

    if(!projectId || !freelancerId || !description){
        return res.status(400).json({message: "Please fill all the fields"});
    }

    if(req.user.role !== "project manager"){
        return res.status(400).json({message: "Only project managers can send proposals"});
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(400).json({ message: "Project not found" });
    }

    // Check if the freelancer is already part of the project
    const freelancerExists = project.freelancers.some(f => f.freelancer.toString() === freelancerId);
    if (freelancerExists) {
        return res.status(400).json({ message: "Freelancer is already part of the project" });
    }

    const proposalExists = project.proposals.some(f => f.freelancer.toString() === freelancerId);
    if (proposalExists) {
        return res.status(400).json({ message: "Proposal of this project has already been send" });
    }

    // Create a new proposal
    const proposal = new Proposal({
        projectName,
        project: projectId,
        deadline,
        freelancer: freelancerId,
        description,
        projectRole
    });

    await proposal.save();

    // add the proposal to the project schema to keep track of the status
    await Project.updateOne(
        {_id: projectId},
        {$push: {proposals: {freelancer: freelancerId, status: "unapproved"}}}
    );

    res.status(200).json({message: "Proposal sent successfully"});
});

// * keep track of the proposals sent by the PM for the respective project(by PM)
const allProposals = asyncHandler(async(req, res) => {
    const {projectId} = req.body;
    const proposals = await Proposal.find({project: projectId}).select('-__v');
    res.status(200).json({proposals});
});

// * view project proposal (by Freelancer)
const viewProposal = asyncHandler(async(req, res) => {
    const proposals = await Proposal.find({freelancer: req.user._id}).select('-__v -freelancer ');
    res.status(200).json({proposals});
});

// get specific project details
const getProjectDetails = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    if (!projectId) {
        return res.status(400).json({ message: "Please provide a project ID" });
    }

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ project });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// * accept the project proposal (by Freelancer)
const acceptProposal = asyncHandler(async(req, res) => {
    const {proposalId} = req.body;

    if(!proposalId){
        return res.status(400).json({message: "Please provide a proposal ID"});
    }

    const proposal = await Proposal.findById(proposalId).populate("project");

    if(!proposal){
        return res.status(400).json({message: "Proposal not found"});
    }

    if(proposal.status === "accepted"){
        return res.status(400).json({message: "Proposal already accepted"});
    }

    if(proposal.status === "rejected"){
        return res.status(400).json({message: "You cannot accept a rejected proposal"});
    }

    try {
        // Update proposal status to 'accepted'
        await Proposal.updateOne({ _id: proposalId }, { status: 'accepted' });

        // Ensure project is updated with the accepted proposal
        const project = await Project.findById(proposal.project._id);
        if (!project) {
            return res.status(400).json({ message: "Project not found" });
        }

        // ! THERE IS A BUG FROM HERE, FIX ME 
        // Update the proposal status in the project's proposals array
        const proposalIndex = project.proposals.findIndex(p => p._id.toString() === proposalId);
        if (proposalIndex !== -1) {
            project.proposals[proposalIndex].status = 'accepted';
        }
        // Add freelancer to the project's freelancers list
        project.freelancers.push({ freelancer: proposal.freelancer, role: proposal.projectRole });
        // ! TILL HERE

        // Add the project to the freelancer's active_projects
        await User.updateOne(
            { _id: proposal.freelancer },
            { $addToSet: { active_projects: project._id } }
        );

        await project.save();

        // * add the user to the group chat

        const chat = await Chat.findOne({ projectId: project._id, isGroupChat: true });
        // console.log(chat);
        chat.users.push(proposal.freelancer);
        await chat.save();

        res.status(200).json({ message: "Proposal for the project accepted" });
    } catch (error) {
        res.status(500).json({ message: "Error accepting proposal", error });
    }
});

// * reject the project proposal (by Freelancer)
const rejectProposal = asyncHandler(async(req, res) => {
    const {proposalId} = req.body;

    if(!proposalId){
        return res.status(400).json({message: "Please provide a proposal ID"});
    }

    const proposal = await Proposal.findById(proposalId);

    if(!proposal){
        return res.status(400).json({message: "Proposal not found"});
    }

    if(proposal.status !== "unapproved"){
        return res.status(400).json({message: "Proposal already accepted/rejected"});
    }

    await Proposal.updateOne({ _id: proposalId }, { status: 'rejected' });

    // ! THERE IS A BUG FROM HERE, FIX ME 
    // Update the proposal status in the project's proposals array
    // const project = await Project.findById(proposal.project);

    // if (!project) {
    //     return res.status(400).json({ message: "Project not found" });
    // }

    // const proposalIndex = project.proposals.findIndex(prop => prop.freelancer.toString() === proposal.freelancer.toString());
    // if (proposalIndex !== -1) {
    //     project.proposals[proposalIndex].status = 'rejected';
    // }
    // await project.save();
    // ! TILL HERE

    res.status(200).json({ message: "Proposal rejected" });
});

module.exports = {
    createProject,
    acceptProject,
    completeProject,
    rejectProject,
    viewProposal,
    sendProposal,
    acceptProposal,
    rejectProposal,
    allProposals,
    unapprovedProjects,
    allPMProjects,
    allClientProjects,
    allFreelancerProjects,
    allProjects,
    getProjectDetails
}