const md5 = require("md5");
const qs = require("querystring");
const { Database } = require("sqlite3");
function register(req, res, next) {
    var usersDB = new Database("users.db", function (err) {
        if (err) {
            return next(err);
        }
        if (!req.body.user) {
            return next(err);
        }
        usersDB.get(
            "SELECT * FROM users WHERE name == ?",
            req.body.user,
            function (err, row) {
                if (err) {
                    return next(err);
                }
                if (row) {
                    var url = qs.stringify({
                        time: 1,
                        text: "User already exists!!!",
                        url: "/",
                    });
                    res.redirect("/redirect?" + url);
                } else {
                    usersDB.run(
                        "INSERT INTO users (name, password) VALUES (?, ?)",
                        req.body.user,
                        md5(req.body.password),
                        function (err) {
                            if (err) {
                                return next(err);
                            }
                            var qstr = qs.stringify({
                                time: 1,
                                text: "Registered",
                                url: "/",
                            });
                            res.redirect("/redirect?" + qstr);
                        }
                    );
                }
            }
        );
    });
}

module.exports = register;