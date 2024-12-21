'use strict';

const { Joi } = require('../../utils/joiUtils');
//load controllers
const { userController } = require(`../../controllers`);
const { PHONE_REGEX, MESSAGES } = require('../../utils/constants');

let routes = [
	{
		method: 'GET',
		path: '/v1/serverResponse/',
		joiSchemaForSwagger: {
			group: 'User',
			description: 'Route to get server response (Is server working fine or not?).',
			model: 'SERVER'
		},
		handler: userController.getServerResponse
	},
	{
		method: 'POST',
		path: '/v1/user/register',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().required().description('User\'s email.'),
				firstName: Joi.string().trim().required().description('User\'s first name.'),
				lastName: Joi.string().trim().required().description('User\'s last name.'),
				email: Joi.string().lowercase().email().required().description('use\'s email'),
				mobile: Joi.string().regex(PHONE_REGEX).error(new Error(MESSAGES.NUMBER_IS_NOT_CORRECT)).required().description('User\'s mobile number.'),
				profileImage: Joi.string().optional().description('User\'s profile image url.'),
			},
			group: 'User',
			description: 'Route to registere a user.',
			model: 'Register_User'
		},
		handler: userController.registerNewUser
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				firstName: Joi.string().required().description('User\'s First name.'),
				password: Joi.string().required().description('User\'s password.')
			},
			group: 'User',
			description: 'Route to login a user.',
			model: 'Login'
		},
		handler: userController.loginUser
	},
	{
		method: 'PUT',
		path: '/v1/user',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description('User \'s JWT token.')
			},
			body: {
				bio: Joi.string().optional().description("User's Bio.").custom((value, helper) => {
                    const wordCount = value.trim().split(/\s+/).length;
                    if (wordCount > 500) {
                        return helper.message('Bio should not exceed 500 words.');
                    }
                    return value;
                }),
				profileImage: Joi.string().optional().description('User\'s profile image url.'),
			},
			group: 'User',
			description: 'Route to update user details.',
			model: 'Update_User_Details'
		},
		auth: "User",
		handler: userController.updateUser
	},
	{
		method: 'POST',
		path: '/v1/uploadFile',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description('User \'s JWT token.')
			},
			formData: {
				file: Joi.file({ name: "file" })

				// file: Joi.object({
				// 	originalname: Joi.string().required().description("Name of the file"),
				// 	mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/jpg', 'video/mp4').required()
				// 		.description("Allowed file types: jpg, png, mp4"),
				// 	size: Joi.number()
				// 		.max(6 * 1024 * 1024) // Max size is 6MB for videos
				// 		.when('mimetype', {
				// 			is: Joi.valid('image/jpeg', 'image/png', 'image/jpg'),
				// 			then: Joi.number().max(1 * 1024 * 1024), // Max size is 1MB for images
				// 		}).required().description("Size of the file in bytes"),
				// }).required().description("Uploaded file"),
			},
			group: 'File',
			description: 'Route to upload a file.',
			model: 'File_Upload'
		},
		auth: 'User',
		handler: userController.uploadFile
	},
	{
		method: 'POST',
		path: '/v1/video',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description('User \'s JWT token.')
			},
			body: {
				title: Joi.string().required().description('Video title.'),
				description: Joi.string().required().description('Video description.'),
				videoURL: Joi.string().required().description('Video url.'),
				thumbnail: Joi.string().required().description('Thumbnail url.'),
			},
			group: 'Video',
			description: 'Route to upload video.',
			model: 'Upload_Video'
		},
		auth: "User",
		handler: userController.createUserVideo
	},
	{
		method: 'GET',
		path: '/v1/videos',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description('User \'s JWT token.')
			},
			query: {
				userId: Joi.string().objectId().optional().description('Uses\'s Id.'),
			},
			group: 'Video',
			description: 'Route to list users video.',
			model: 'List_User_Videos'
		},
		auth: "User",
		handler: userController.listUserVideos
	},
	{
		method: 'GET',
		path: '/v1/users/list',
		joiSchemaForSwagger: {
			headers: {
				'authorization': Joi.string().required().description('User \'s JWT token.')
			},
			query: {
				skip: Joi.number().default(0).optional().description('Skip.'),
				limit: Joi.number().default(10).optional().description('Limit.')
			},
			group: 'User',
			description: 'Route to list users.',
			model: 'List_Users'
		},
		auth: "User",
		handler: userController.listUsers
	},
];

module.exports = routes;