

module.exports = function (req,db) {
    const auth_token = req.headers['x-api-key'];

    if (auth_token === undefined || user_token === undefined) {
        return false;
    }

    if (auth_token !== '1234') {
        return false;
    } else {
        return true
    }
}
    

