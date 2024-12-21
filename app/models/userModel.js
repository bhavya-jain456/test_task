'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************* User Model ***********/
const userSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    mobile: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String },
    profileImage: { type: String, set: url => url === '' ? undefined : url },
    bio: { type: String }
}, { timestamps: true, versionKey: false, collection: 'users' });

module.exports = MONGOOSE.model('user', userSchema);