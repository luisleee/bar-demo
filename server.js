const fs = require("fs");
const ejs = require("ejs");
const { join } = require("path");
const logger = require("morgan");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

var app = express();
app.engine(".ejs", ejs.renderFile);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "secret", saveUninitialized: true, resave: true }));

// TODO: Split them into modules
// TODO: Improve the DB
// TODO: Refresh it immediately by WS

function isLogin(req, res, next) {
    if (!req.session.loggedIn) {
        return next("route");
    }
    next();
}

app.get("/", function (req, res, next) {
    if (req.session.loggedIn) {
        var messages = require("./message.json");
        var data = {
            username: req.session.name,
            messages: messages.messages,
        };
        res.render(join(__dirname, "pages/index-yes.ejs"), data);
    } else {
        res.sendFile(join(__dirname, "pages/index-not.html"));
    }
});

app.post("/login", function (req, res, next) {
    var passwd = require("./passwd.json");
    if (!passwd[req.body.user] || req.body.password !== passwd[req.body.user]) {
        res.sendFile(join(__dirname, "pages/bad-passwd.html"));
    } else {
        req.session.loggedIn = true;
        req.session.name = req.body.user;
        res.redirect("/");
    }
});

app.get("/logout", isLogin, function (req, res, next) {
    req.session.loggedIn = false;
    res.redirect("/");
});

app.post("/register", function (req, res) {
    var passwd = require("./passwd.json");
    if (passwd[req.body.user]) {
        res.sendFile(join(__dirname, "pages/alredy-exist.html"));
    } else {
        passwd[req.body.user] = req.body.password;
        var json = JSON.stringify(passwd);
        fs.writeFile("./passwd.json", json, function (err) {
            if (err) {
                return next(err);
            }
            res.sendFile(join(__dirname, "pages/registered.html"));
        });
    }
});

app.post("/send", isLogin, function (req, res, next) {
    var name = req.session.name;
    var msg = req.body.message;
    var time = new Date().toLocaleString();
    var obj = {
        time: time,
        message: msg,
        user: name,
    };
    var original = require("./message.json");
    original.messages.unshift(obj);
    var json = JSON.stringify(original);
    fs.writeFile("message.json", json, function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.use(express.static("public"));

app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send("Error!!!");
    next();
});

app.listen("3000", function () {
    console.log("OK");
});
