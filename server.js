const ejs = require("ejs");
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
app.engine(".ejs", ejs.renderFile);
app.use(logger("dev"));
app.use(express.json());
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
// TODO: Encrypt the password
// TODO: Adjust stylesheet
// TODO: Add delete account and change password feature

function isLogin(req, res, next) {
    if (!req.session.loggedIn) {
        return next("route");
    }
    next();
}

app.get("/", function (req, res, next) {
    if (req.session.loggedIn) {
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
                res.render(join(__dirname, "pages/index-yes.ejs"), data);
            });
        });
    } else {
        res.sendFile(join(__dirname, "pages/index-not.html"));
    }
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
                if (!row || row.password !== req.body.password) {
                    var url = qs.stringify({
                        time: 1,
                        text: "Bad username or password!!!",
                        url: "/",
                    });
                    res.redirect("/redirect?" + url);
                } else {
                    req.session.loggedIn = true;
                    req.session.name = req.body.user;
                    res.redirect("/");
                }
            }
        );
    });
});

app.get("/logout", isLogin, function (req, res, next) {
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
                        req.body.password,
                        function (err) {
                            if (err) {
                                return next(err);
                            }
                            var url = qs.stringify({
                                time: 1,
                                text: "Registered",
                                url: "/",
                            });
                            res.redirect("/redirect?" + url);
                        }
                    );
                }
            }
        );
    });
});

app.post("/send", isLogin, function (req, res, next) {
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

app.get("/redirect", function (req, res, next) {
    var url = req.query.url ? req.query.url : "/";
    var time = req.query.time ? req.query.time : 1;
    var text = req.query.text ? req.query.text : "Redirecting...";
    var context = { url, time, text };
    res.render(join(__dirname, "pages/redirect.ejs"), context);
});

app.use(express.static("public"));

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
