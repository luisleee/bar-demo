const { Database } = require("sqlite3");
const md5 = require("md5");
function login(req, res, next) {
    let usersDB = new Database("users.db", function (err) {
        if (err) {
            return next(err);
        }
        usersDB.get(
            "SELECT * FROM users WHERE name == ?",
            req.body.user,
            function (err, row) {
                if (err) {
                    return next(err);
                }
                if (!row || row.password !== md5(req.body.password)) {
                    let qstr = qs.stringify({
                        time: 1,
                        text: "Bad username or password!!!",
                        url: "/",
                    });
                    res.redirect("/redirect?" + qstr);
                } else {
                    req.session.loggedIn = true;
                    req.session.name = req.body.user;
                    res.redirect("/");
                }
            }
        );
    });
}
module.exports = login;
