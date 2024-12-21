"use strict";
const { createSuccessResponse, createErrorResponse } = require("../helpers/resHelper");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../utils/constants');
const { dbSerice, fileUploadService } = require('../services');
const { UserModel, SessionModel, UserVideoModel } = require('../models');
const { compareHash, encryptJwt, sendEmail, hashPassword, generateRandomPassword } = require(`../utils/utils`);

/**************************************************
 ***** Auth controller for authentication logic ***
 **************************************************/
let userController = {};

/**
 * function to get server response.
 */
userController.getServerResponse = async (payload) => {
  return createSuccessResponse(MESSAGES.SERVER_IS_WORKING_FINE);
};

/**
 * function to register a user to the system.
 */
userController.registerNewUser = async (payload) => {
  let user = await dbSerice.findOne(UserModel, { $or: [ { email: payload.email }, { mobile: payload.mobile } ] });
  if(user) throw createErrorResponse(MESSAGES.USER_ALREADY_EXIST, ERROR_TYPES.ALREADY_EXISTS);

  payload.password = generateRandomPassword(payload.firstName, payload.lastName, payload.mobile);
  await sendEmail(payload);

  payload.password = hashPassword(payload.password);
  user = await dbSerice.create(UserModel, payload);
  return createSuccessResponse(MESSAGES.CONFIRMATION_LINK_SENT_TO_YOUR_EMAIL)
};


/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {
  // check is user exists in the database with provided email or not.
  let user = await dbSerice.findOne(UserModel, { firstName: payload.firstName }, NORMAL_PROJECTION);
  if (user) {
    // compare user's password.
    if (compareHash(payload.password, user.password)) {

      let token = encryptJwt({ userId: user._id });
      await dbSerice.findOneAndUpdate(SessionModel, { userId: user._id }, { token }, { upsert: true });
      return createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY, { user, token });
    }
    throw createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
  }
  throw createErrorResponse(MESSAGES.INVALID_NAME, ERROR_TYPES.BAD_REQUEST);
};

/**
 * Function to update user profile image and bio
 */
userController.updateUser = async (payload) => {
  if(!payload.bio && !payload.profileImage) throw createErrorResponse(MESSAGES.INVALID_REQUEST, ERROR_TYPES.BAD_REQUEST);
  await dbSerice.findOneAndUpdate(UserModel, { _id: payload.user._id }, { ...payload });
  return createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY); 
}

/**
 * function to upload the file to the s3 
 * @param {*} payload 
 */
userController.uploadFile = async (payload) => {
  const { file } = payload;

  // Define validation rules
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB
  const MAX_VIDEO_SIZE = 6 * 1024 * 1024; // 6 MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4'];

  // Check for valid mimetype
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    // It's an image, validate image size
    if (file.size > MAX_IMAGE_SIZE) throw createErrorResponse('Image file size must be less than or equal to 1 MB.', ERROR_TYPES.BAD_REQUEST);
  } else if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    // It's a video, validate video size
    if (file.size > MAX_VIDEO_SIZE) throw createErrorResponse('Video file size must be less than or equal to 6 MB.', ERROR_TYPES.BAD_REQUEST);
  } else {
    // Unsupported file type
    throw createErrorResponse('Invalid file type. Only JPEG, PNG images, and MP4 videos are allowed.', ERROR_TYPES.BAD_REQUEST);
  }

  let fileUrl = await fileUploadService.uploadFileToLocal(payload);
  return Object.assign(createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { fileUrl })
}

/**
 * Function to create user video
 */
userController.createUserVideo = async (payload) => {
  console.log("INSIDE THISSSSS", payload)
  await dbSerice.create(UserVideoModel, { userId: payload.user._id, ...payload });
  return createSuccessResponse(MESSAGES.VIDEO_CREATED_SUCCESSFULLY); 
}

/**
 * Function to list user video
 */
userController.listUserVideos = async (payload) => {
  let videos = await dbSerice.find(UserVideoModel, { userId: !payload.userId ? payload.user._id : payload.userId }, NORMAL_PROJECTION);
  return createSuccessResponse(MESSAGES.USER_VIDEOS_LISTED_SUCCESSFULLY, videos); 
}

/**
 * Function to list users
 */
userController.listUsers = async (payload) => {

  let usersAggregateQuery = [
    { $sort: { createdAt: -1 } },
    { $lookup: { 
      from: "userVideo",
      let: { userId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: [ '$userId', '$$userId' ] } } },
        { $limit: 5 },
        { $project: {
          _id: 0,
          title: 1,
          description: 1,
          videoURL: 1,
          thumbnail: 1
        }}
      ],
      as: 'userVideos'
    }},
    { $project: {
      userVideos: 1,
      firstName: 1,
      profileImage: 1
    }},
    { $facet: {
      usersData: [
        { $skip: payload.skip },
        { $limit: payload.limit }
      ], 
      totalCount: [{ '$count': 'total' }]
    }}
  ];

  let users = (await dbSerice.aggregate(UserModel, usersAggregateQuery))[0];
  let totalCount = users.totalCount.length ? users.totalCount[0].total : 0;
  return createSuccessResponse(MESSAGES.USERS_FETCHED_SUCCESSFULLY, { users: users.usersData, totalCount });
};

/* export userController */
module.exports = userController;