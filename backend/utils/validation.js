const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional()
});

const signinSchema = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const createBlogSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    authorId: Joi.string().required()
});

const updateBlogSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    id: Joi.string().required()
});

module.exports = {
    signupSchema,
    signinSchema,
    createBlogSchema,
    updateBlogSchema
};