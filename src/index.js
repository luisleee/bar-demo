const http = require("http");
const logger = require("morgan");
const express = require("express");
const socketIO = require("socket.io");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const sqliteStoreFactory = require("connect-sqlite3");
const SqliteStore = sqliteStoreFactory(session);

const init = require("./util/init");
const isLogin = require("./util/isLogin");
const emitter = require("./util/emitter");
const message = require("./get/message");
const homepage = require("./get/homepage");
const reply = require("./post/reply");
const login = require("./post/login");
const logout = require("./get/logout");
const register = require("./post/register");
const deleteUser = require("./post/deleteUser");
const redirect = require("./util/redirect");
const changePassword = require("./post/changePassword");
const account = require("./get/account");
const send = require("./post/send");

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
emitter.setEmitter(io);

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        store: new SqliteStore(),
        secret: "secret",
        saveUninitialized: true,
        resave: true,
    })
);

// TODO: Adjust stylesheet
// TODO: Validate form

// The main page, must be loggedin
app.get("/", isLogin, homepage);

// Show the message
app.get("/p/:id", message);

// Logout
app.get("/logout", isLogin, logout);

// Show account center
app.get("/account", isLogin, account);

// Redirect page
app.get("/redirect", redirect);

// Reply the message
app.post("/reply/:id", reply);

// Login
app.post("/login", login);

// Register new user
app.post("/register", register);

// Delete user
// TODO: Change the URL later
app.post("/delete", isLogin, deleteUser);

// Change password
app.post("/change-password", isLogin, changePassword);

// Send message
app.post("/send", isLogin, send);

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

// Init databases
init(function (err) {
    if (err) {
        console.log(err);
        return;
    }
    server.listen("3000", function () {
        console.log("OK");
    });
});
