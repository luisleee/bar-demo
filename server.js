const connect = require("connect");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const ejs = require("ejs");

var app = connect();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "GMW", saveUninitialized: true, resave: true }));
app.use(function (req, res, next) {
    if (req.url === "/" && req.session.loggedIn) {
        var data = {
            username: req.session.name,
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
    } else {
        next();
    }
});
app.use(function(req,res,next){
    if(req.url === "/logout"){
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
    }else{
        next();
    }
});

var server = http.createServer(app);
server.listen("3000", function () {
    console.log("OK");
});
