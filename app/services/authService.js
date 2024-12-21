const jwt = require('jsonwebtoken');

const { SECURITY, MESSAGES, ERROR_TYPES, NORMAL_PROJECTION } = require('../utils/constants');
const HELPERS = require("../helpers");
const { UserModel, SessionModel } = require(`../models`);

let authService = {};

/**
 * function to authenticate user and attach user to request
 * @param {*} request 
 */
const authenticateUser = async (request) => {
    try {

        let session = await SessionModel.findOne( { token: request.headers.authorization }).lean();
        if(!session) throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);

        // authenticate JWT token and attach user to request object (request.user)
        let decodedToken = jwt.verify(request.headers.authorization, SECURITY.JWT_SIGN_KEY);
        let authenticatedUser = await UserModel.findOne({ _id: (decodedToken.userId) }, { ...NORMAL_PROJECTION, password: 0 }).lean();
        if (!authenticatedUser) {
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
        }
        request.user = authenticatedUser;
        return authenticatedUser;
    } catch (err) {
        console.log("ERRORRR", err)
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
    }
}

/**
 * function to check authentication and authorisation for user.
 * @param {*} roles authorised roles array
 */

authService.validateUser = (roles = []) => {
    return (request, response, next) => {
        authenticateUser(request)
            .then(user => {
                // authoriseUser(request, roles);
                // authentication and authorization successful
                return next();
            })
            .catch(err => {
                response.status(err.statusCode).json(err);
            })
    };
};

module.exports = authService;