'use strict';

/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    SessionModel: require(`../models/sessionModel`),
    UserModel: require(`../models/userModel`),
    UserVideoModel: require(`../models/videoModel`),
};