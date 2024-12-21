let CONSTANTS = require('./constants');
const MONGOOSE = require('mongoose');
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const CONFIG = require('../../config');


let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
  return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
  return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
  return Object.keys(obj).map(key => obj[key]);
};

/** used for converting string id to mongoose object id */
commonFunctions.convertIdToMongooseId = (stringId) => {
  return MONGOOSE.Types.ObjectId(stringId);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
  let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256', expiresIn: '24h' });
  return token;
};

commonFunctions.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
  let errorMessage = '';
  if (error.message.indexOf("[") > -1) {
    errorMessage = error.message.substr(error.message.indexOf("["));
  } else {
    errorMessage = error.message;
  }
  errorMessage = errorMessage.replace(/"/g, '');
  errorMessage = errorMessage.replace('[', '');
  errorMessage = errorMessage.replace(']', '');
  error.message = errorMessage;
  return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.messageLogs = (error, success) => {
  if (error)
    console.log(`\x1b[31m` + error);
  else
    console.log(`\x1b[32m` + success);
};

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort 
 * @param {*} skip 
 * @param {*} limit 
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
  let condition = [
    ...(!!sort ? [{ $sort: sort }] : []),
    { $skip: skip },
    { $limit: limit }
  ];
  return condition;
};

/**
 * Send an email to perticular user mail 
 * @param {*} email email address
 * @param {*} subject  subject
 * @param {*} content content
 * @param {*} cb callback
 */
commonFunctions.sendEmail = async (userData) => {
  const transporter = require('nodemailer').createTransport(CONFIG.SMTP.TRANSPORT);

  const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Welcome Email</title>
      </head>
      <body>
          <h1>Welcome to Our Service</h1>
          <p>Dear <strong>${userData.firstName} ${userData.lastName}</strong>,</p>
          <p>Thank you for creating your account. Your account password is: <strong>${userData.password}</strong></p>
          <p>Please keep this information secure and do not share it with anyone.</p>
      </body>
      </html>
  `;

  let emailToSend = {
    to: userData.email,
    from: CONFIG.SMTP.SENDER,
    subject: 'Welcome to Our Service',
    html: emailTemplate
  };

  return await transporter.sendMail(emailToSend);
};

commonFunctions.generateRandomPassword = (firstName, lastName, mobileNumber) => {
  // Extract parts of the input
  const firstPart = firstName.slice(0, 2); // First 2 letters of the first name
  const lastPart = lastName.slice(-2);    // Last 2 letters of the last name
  const mobilePart = mobileNumber.slice(-4); // Last 4 digits of the mobile number

  // Generate random string
  const randomString = Math.random().toString(36).substring(2, 6); // 4 random alphanumeric characters

  // Combine all parts into an array
  const parts = [firstPart, lastPart, mobilePart, randomString];

  // Shuffle the array
  for (let i = parts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  // Join the shuffled parts to form the password
  return parts.join('');
}

module.exports = commonFunctions;

