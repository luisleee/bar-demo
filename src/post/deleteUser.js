const { Database } = require("sqlite3");
function deleteUser(req, res, next) {
    let usersDB = new Database("users.db", function (err) {
        if (err) {
            return next(err);
        }
        usersDB.run(
            "DELETE FROM users WHERE name == ?",
            req.session.name,
            function (err) {
                if (err) {
                    return next(err);
                }
                req.session.loggedIn = false;
                res.redirect("/");
            }
        );
    });
}

module.exports = deleteUser;