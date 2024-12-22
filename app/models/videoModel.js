'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

/************* Video Model ***********/
const userVideoSchema = new Schema({
    title: { type: String },
    description: { type: String },
    videoURL: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users'}
}, { timestamps: true, versionKey: false, collection: 'userVideo' });

module.exports = MONGOOSE.model('userVideo', userVideoSchema);