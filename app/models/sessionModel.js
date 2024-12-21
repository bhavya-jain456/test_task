'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { TOKEN_TYPES, USER_TYPE } = require('../utils/constants');

/************* user Session Model ***********/
const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' }, 
    token: { type: String }, 
    tokenExpDate: { type: Date },
}, { timestamps: true, versionKey: false, collection: 'sessions' });

module.exports = MONGOOSE.model('session', sessionSchema);