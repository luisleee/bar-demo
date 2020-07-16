const md5 = require("md5");
const init = require("./init");
const { join } = require("path");
const logger = require("morgan");
const qs = require("querystring");
const express = require("express");
const { Database } = require("sqlite3");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqliteStoreFactory = require("connect-sqlite3");
const sqliteStore = sqliteStoreFactory(session);

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        store: new sqliteStore(),
        secret: "secret",
        saveUninitialized: true,
        resave: true,
    })
);

// TODO: Split them into modules
// TODO: Refresh it immediately by WS
// TODO: Adjust stylesheet

// Check if the user has logged-in
// If not, redirect to login
function isLoggedIn(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect("/login-page.html");
    } else {
        next();
    }
}

// The main page, must be loggedin
app.get("/", isLoggedIn, function (req, res, next) {
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        messagesDB.all("SELECT * FROM messages", function (err, rows) {
            if (err) {
                return next(err);
            }
            var data = {
                username: req.session.name,
                messages: rows.reverse(),
            };
            res.render(join(__dirname, "pages/index.ejs"), data);
        });
    });
});

app.post("/login", function (req, res, next) {
    var usersDB = new Database("users.db", function (err) {
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
                    var qstr = qs.stringify({
                        time: 1,
                        text: "Bad username or password!!!",
                        url: "/login-page.html",
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
});

app.get("/logout", isLoggedIn, function (req, res, next) {
    req.session.loggedIn = false;
    res.redirect("/");
});

app.post("/register", function (req, res) {
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
                        url: "/register-page.html",
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
                                url: "/login-page.html",
                            });
                            res.redirect("/redirect?" + qstr);
                        }
                    );
                }
            }
        );
    });
});

app.post("/delete", isLoggedIn, function (req, res, next) {
    var usersDB = new Database("users.db", function (err) {
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
});

app.post("/change-password", isLoggedIn, function (req, res, next) {
    if (!req.body.oldPass || !req.body.newPass) {
        var qstr = qs.stringify({
            time: 1,
            text: "No password",
            url: "/account",
        });
        res.redirect("/redirect?" + qstr);
        return;
    }
    var usersDB = new Database("users.db", function (err) {
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
                    var qstr = qs.stringify({
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
                        var qstr = qs.stringify({
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
});

app.get("/account", isLoggedIn, function (req, res, next) {
    var context = { name: req.session.name };
    res.render(join(__dirname, "pages/account.ejs"), context);
});

// Send message
app.post("/send", isLoggedIn, function (req, res, next) {
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        var name = req.session.name;
        var msg = req.body.message;
        var time = new Date().toLocaleString();
        if (!msg) {
            return next(err);
        }
        messagesDB.run(
            "INSERT INTO messages (user, message, time) VALUES (?, ?, ?)",
            name,
            msg,
            time,
            function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect("/");
            }
        );
    });
});

// Redirect page
app.get("/redirect", function (req, res, next) {
    var url = req.query.url ? req.query.url : "/";
    var time = req.query.time ? req.query.time : 1;
    var text = req.query.text ? req.query.text : "Redirecting...";
    var context = { url, time, text };
    res.render(join(__dirname, "pages/redirect.ejs"), context);
});

// Deploy static files
app.use(express.static("public"));

// Handle 404
app.use(function (req, res, next) {
    res.redirect("/404.html");
    next();
});

// Handle error and send 500
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send("Error!!!");
    next();
});

init(function (err) {
    if (err) {
        console.log(err);
        return;
    }
    app.listen("3000", function () {
        console.log("OK");
    });
});
