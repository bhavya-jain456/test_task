const CONSTANTS = require('../utils/constants');
const MODELS = require('../models/index');
let dbUtils = {};

/**
 * Funcion to migrate database.
 */
dbUtils.migrateDatabase = async () => {
  let dbVersion = await MODELS.versionModel.findOne();
  let version = dbVersion ? dbVersion.dbVersion : 0;
  if (version < 1) {
    //Migration Operation 
  }
  return;
};

module.exports = dbUtils;