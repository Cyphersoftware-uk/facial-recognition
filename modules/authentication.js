

module.exports = function (req,db) {
    const auth_token = req.headers['x-api-key'];
    const user_token = req.headers['x-user-token'];

    if (auth_token === undefined || user_token === undefined) {
        return false;
    }

    const query = postgres.sql`
        SELECT * FROM users
        WHERE auth_token = ${auth_token}
        AND user_token = ${user_token}
    `;

    if (query === undefined) {
        return false;
    } else {
        return true;
    }


}
    

