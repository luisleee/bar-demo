const connect = require("connect");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const static = require("serve-static");

var app = connect();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "GMW", saveUninitialized: true, resave: true }));

//TODO: Use express to rewrite it
//TODO: Split them into modules

app.use(function (req, res, next) {
    if (req.url === "/" && req.session.loggedIn) {
        var messages = require("./message.json");
        var data = {
            username: req.session.name,
            messages: messages.messages,
        };
        ejs.renderFile("public/index-yes.ejs", data, function (err, str) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end();
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(str);
        });
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    if (req.url === "/" && req.method === "GET") {
        fs.readFile("public/index-not.html", function (err, buff) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end();
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            var str = buff.toString();
            res.end(str);
        });
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    if (req.url === "/login" && req.method === "POST") {
        var passwd = require("./passwd.json");
        if (
            !passwd[req.body.user] ||
            req.body.password !== passwd[req.body.user]
        ) {
            fs.readFile("public/bad-passwd.html", function (err, buff) {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end();
                    return;
                }
                res.writeHead(200, { "Content-Type": "text/html" });
                var str = buff.toString();
                res.end(str);
            });
        } else {
            fs.readFile("public/login.html", function (err, buff) {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end();
                    return;
                }
                req.session.loggedIn = true;
                req.session.name = req.body.user;
                res.writeHead(200, { "Content-Type": "text/html" });
                var str = buff.toString();
                res.end(str);
            });
        }
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    if (req.url === "/logout") {
        fs.readFile("public/logout.html", function (err, buff) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end();
                return;
            }
            req.session.loggedIn = false;
            res.writeHead(200, { "Content-Type": "text/html" });
            var str = buff.toString();
            res.end(str);
        });
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    if (req.url === "/register" && req.method === "POST") {
        var passwd = require("./passwd.json");
        if (passwd[req.body.user]) {
            fs.readFile("public/already-exist.html", function (err, buff) {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end();
                    return;
                }
                res.writeHead(200, { "Content-Type": "text/html" });
                var str = buff.toString();
                res.end(str);
            });
        } else {
            passwd[req.body.user] = req.body.password;
            var json = JSON.stringify(passwd);
            fs.writeFile("./passwd.json", json, function (err) {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end();
                    return;
                }
                fs.readFile("public/registered.html", function (err, buff) {
                    if (err) {
                        console.log(err);
                        res.writeHead(500);
                        res.end();
                        return;
                    }
                    res.writeHead(200, { "Content-Type": "text/html" });
                    var str = buff.toString();
                    res.end(str);
                });
            });
        }
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    if (req.url === "/send" && req.method === "POST" && req.session.loggedIn) {
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
                console.log(err);
                res.writeHead(500);
                res.end();
                return;
            }
            fs.readFile("public/sended.html", function (err, buff) {
                if (err) {
                    console.log(err);
                    res.writeHead(500);
                    res.end();
                    return;
                }
                res.writeHead(200, { "Content-Type": "text/html" });
                var str = buff.toString();
                res.end(str);
            });
        });
    } else {
        next();
    }
});

app.use(static("www"));

var server = http.createServer(app);
server.listen("3000", function () {
    console.log("OK");
});
