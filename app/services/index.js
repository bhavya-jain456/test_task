
const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    authService: require(`./authService`),
    dbSerice: require('./dbService'),
    fileUploadService: require(`./fileUploadService`),
    swaggerService: require(`./swaggerService`)
};