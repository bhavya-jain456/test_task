'use strict';

let dbService = {};

/**
* function to create.
*/
dbService.create = async (model, payload) => {
    return await new model(payload).save();
};

/**
* function to insert.
*/
dbService.insertMany = async (model, payload) => {
    return await model.insertMany(payload);
};

/**
* function to find.
*/
dbService.find = async (model, criteria, projection = {}) => {
    return await model.find(criteria, projection).lean();
};

/**
* function to find one.
*/
dbService.findOne = async (model, criteria, projection = {}) => {
    return await model.findOne(criteria, projection).lean();
};

/**
* function to find One with pagination.
*/
dbService.findOnePagination = async (model, criteria, projection = {}, sort = {}) => {
    return await model.findOne(criteria, projection, {sort: sort }).lean();
};


/**
* function to find with pagination.
*/
dbService.findPagination = async (model, criteria, projection = {}, skip, limit, sort = {}) => {
    return await model.find(criteria, projection).skip(skip).limit(limit).sort(sort).lean();
};

/**
* function to update one.
*/
dbService.findOneAndUpdate = async (model, criteria, dataToUpdate, projection = { new: true }) => {
    return await model.findOneAndUpdate(criteria, dataToUpdate, projection).lean();
};

/**
* function to update.
*/
dbService.updateMany = async (model, criteria, dataToUpdate, projection = {}) => {
    return await model.updateMany(criteria, dataToUpdate, projection).lean();
};

/**
* function to delete one.
*/
dbService.deleteOne = async (model, criteria) => {
    return await model.deleteOne(criteria);
};

/**
* function to delete.
*/
dbService.deleteMany = async (model, criteria) => {
    return await model.deleteMany(model, criteria);
};

/**
* function to apply aggregate on.
*/
dbService.aggregate = async (model, query) => {
    return await model.aggregate(query);
};

module.exports = dbService;