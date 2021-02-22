const qs = require("querystring");
const { Database } = require("sqlite3");
function changePassword(req, res, next) {
    if (!req.body.oldPass || !req.body.newPass) {
        let qstr = qs.stringify({
            time: 1,
            text: "No password",
            url: "/account",
        });
        res.redirect("/redirect?" + qstr);
        return;
    }
    let usersDB = new Database("users.db", function (err) {
        if (err) {
            return next(err);
        }
        usersDB.get(
            "SELECT * FROM users WHERE name == ?",
            req.session.name,
            function (err, row) {
                if (err) {
                    return next(err);
                }
                if (!row) {
                    return next(err);
                }
                if (row.password !== md5(req.body.oldPass)) {
                    let qstr = qs.stringify({
                        time: 1,
                        text: "Bad password",
                        url: "/account",
                    });
                    res.redirect("/redirect?" + qstr);
                    return;
                }
                usersDB.run(
                    "UPDATE users SET password = ? WHERE name = ?",
                    md5(req.body.newPass),
                    req.session.name,
                    function (err) {
                        if (err) {
                            return next(err);
                        }
                        let qstr = qs.stringify({
                            time: 1,
                            text: "Password changed!",
                            url: "/account",
                        });
                        res.redirect("/redirect?" + qstr);
                        return;
                    }
                );
            }
        );
    });
}

module.exports = changePassword;