const Project = require("../models/projectModel");
const Freelancer = require("../models/freelancerModel");
const asyncHandler = require("express-async-handler");

// * search freelancer skills
const searchSkills = asyncHandler(async(req, res) => {
    const {skills} = req.body;

    if(!skills){
        return res.status(400).json({message: "Please provide skills to search"});
    }

     // Ensure skills is an array and not empty
     if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ message: "Skills should be a non-empty array" });
    }

    // Create case insensitive regex for each skill
    const skillRegexes = skills.map(skill => new RegExp(skill, 'i'));

    const freelancers = await Freelancer.find({ skills: { $in: skillRegexes } }).select('userId hourlyRate education experience portfolio servicesList skills languages');

    // Sort freelancers by the number of matching skills
    const sortedFreelancers = freelancers.map(freelancer => {
        const matchingSkillsCount = freelancer.skills.filter(skill => skills.includes(skill)).length;
        return { freelancer, matchingSkillsCount };
    }).sort((a, b) => b.matchingSkillsCount - a.matchingSkillsCount)
      .map(item => item.freelancer);

    res.status(200).json({ freelancers: sortedFreelancers });
});

module.exports = {
    searchSkills,
}