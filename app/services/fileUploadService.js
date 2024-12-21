const AWS = require('aws-sdk');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const CONFIG = require('../../config');
const fileUploadService = {};
AWS.config.update({ accessKeyId: CONFIG.AWS.accessKeyId, secretAccessKey: CONFIG.AWS.secretAccessKey });
let s3Bucket = new AWS.S3();
const { AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS, SERVER, MESSAGES, ERROR_TYPES } = require(`../utils/constants`);
const { createErrorResponse } = require("../helpers/resHelper");

/**
 * function to upload a file to s3(AWS) bucket.
 */
fileUploadService.uploadFileToS3 = (payload, fileName, bucketName) => {
    return new Promise((resolve, reject) => {
        s3Bucket.upload({
            Bucket: bucketName || CONFIG.AWS.bucketName,
            Key: fileName,
            Body: payload.file.buffer,
            ACL: 'public-read',
        }, function (err, data) {
            if (err) {
                console.log('Error here', err);
                return reject(err);
            }
            resolve(data.Location);
        });
    });
};

/**
 * function to upload file to local server.
 */
fileUploadService.uploadFileToLocal = async (payload) => {
    const directoryPath = path.resolve(__dirname + `../../../public/uploads`);
    const fileExtension = payload.file.originalname.split('.').pop().toLowerCase();

    const fileName = `upload_${Date.now()}${payload.file.originalname}`;
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }

    const fileSavePath = `${directoryPath}/${fileName}`;
    const writeStream = fs.createWriteStream(fileSavePath);

    return new Promise((resolve, reject) => {
        writeStream.write(payload.file.buffer);
        writeStream.on('error', (err) => reject(err));
        writeStream.end((err) => {
            if (err) {
                reject(err);
            } else {
                const fileUrl = `${CONFIG.SERVER_URL}/public/uploads/${fileName}`;
                resolve(fileUrl);
            }
        });
    });
};

/**
 * function to upload a file on either local server or on s3 bucket.
 */
fileUploadService.uploadFile = async (payload, pathToUpload, pathOnServer) => {
    let fileExtention = payload.file.originalname.split('.')[1];
    if (AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS.indexOf(fileExtention) !== -(SERVER.ONE)) {
        let fileName = `upload_${Date.now()}.${fileExtention}`, fileUrl = '';
        let UPLOAD_TO_S3 = process.env.UPLOAD_TO_S3 ? process.env.UPLOAD_TO_S3 : '';
        if (UPLOAD_TO_S3.toLowerCase() === 'true') {
            let s3BucketName = CONFIG.s3Bucket.normalFilesPath;
            fileUrl = await fileUploadService.uploadFileToS3(payload, fileName, s3BucketName);
        } else {
            fileUrl = await fileUploadService.uploadFileToLocal(payload, fileName, pathToUpload, pathOnServer);
        }
        return fileUrl;
    }
    throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_FILE_TYPE, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to upload file to local server.
 */
fileUploadService.uploadMultipleFilesToLocal = async (payload, pathToUpload) => {
    console.log('uploading multiple files ', payload.files.length);
    let directoryPath = pathToUpload;
    // create user's directory if not present.
    fse.ensureDirSync(directoryPath);
    const promises = payload.files.map(file => {
        console.log(file.originalname);
        let fileSavePath = `${directoryPath}/${file.originalname}`;
        const writeStream = fs.createWriteStream(fileSavePath);
        return new Promise((resolve, reject) => {
            writeStream.write(file.buffer);
            writeStream.on('error', reject);
            writeStream.end(err => {
                if (err) reject(err)
                else {
                    resolve(file.originalname);
                }
            });
        });
    });
    return Promise.all(promises);
};

/**
 * function to delete the multiple files from local
 */

fileUploadService.deleteMultipleFilesFromLocal = async (payload, pathToDelete) => {
    console.log('deleting multiple files ');
    let directoryPath = pathToDelete;
    let promises = [];
    for (let index = 0; index < payload.fileNames.length; index++) {
        let fileName = payload.fileNames[index];
        let fileDeletePath = `${directoryPath}/${fileName}`;
        if (!fs.existsSync(fileDeletePath)) continue;
        let promise = new Promise((resolve, reject) => {
            fs.unlink(fileDeletePath, err => {
                if (err) reject(err)
                else resolve('ok');
            });
        });
        promises[index] = promise;
    }
    return Promise.all(promises);
}

(async function(){

// Resolve the path to public/uploads
const directoryPath = path.resolve(__dirname, '../../../public/uploads');
console.log("directoryPath==========", directoryPath)
// Ensure the parent directories are also created
if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });  // Use 'recursive: true'
    console.log('public/uploads folder created');
} else {
    console.log('public/uploads folder already exists');
}
})
module.exports = fileUploadService;