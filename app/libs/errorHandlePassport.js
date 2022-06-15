
const response = require('../../utils/formatResponse');

module.exports = (err, req, res, next) => {
    console.log("Masuk Sini");
    console.log(err);
    if (!res.headersSent) {
        if (err.message === 'No auth token') {
            return response(res, 401, false, err.message, null);
        } else if (err.message === 'Invalid token') {
            return response(res, 400, false, err.message, null);
        } else if (err.message === 'jwt expired') {
            return response(res, 400, false, err.message, null);
        } else if (err.message === 'ErrorInputExtension') {
            return response(res, 415, false, "Unsupport Media Type", null);
        } else {
            const msg = err.message || 'Internal Server Error';
            return response(res, 500, false, msg, null);
        }
    }
}