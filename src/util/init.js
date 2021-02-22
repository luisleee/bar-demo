const { Database } = require("sqlite3");
const fs = require("fs");
const exists = fs.existsSync;

function initUsers(fn) {
    if (!exists("users.db")) {
        let DB = new Database("users.db", function (err) {
            if (err) {
                return fn(err);
            }
            DB.run(
                "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)",
                function (err) {
                    if (err) {
                        return fn(err);
                    }
                    DB.close(function (err) {
                        if (err) {
                            return fn(err);
                        }
                        return fn(null);
                    });
                }
            );
        });
    } else {
        return fn(null);
    }
}

function initMessages(fn) {
    if (!exists("messages.db")) {
        let DB = new Database("messages.db", function (err) {
            if (err) {
                return fn(err);
            }
            DB.run(
                "CREATE TABLE topics (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, title TEXT, text TEXT, time TEXT)",
                function (err) {
                    if (err) {
                        return fn(err);
                    }
                    DB.close(function (err) {
                        if (err) {
                            return fn(err);
                        }
                        return fn(null);
                    });
                }
            );
            DB.run(
                "CREATE TABLE replies (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, message TEXT, fa INTEGER, time TEXT)",
                function (err) {
                    if (err) {
                        return fn(err);
                    }
                    DB.close(function (err) {
                        if (err) {
                            return fn(err);
                        }
                        return fn(null);
                    });
                }
            );
        });
    } else {
        return fn(null);
    }
}

function init(fn) {
    let promiseUsers = new Promise(function (res, rej) {
        initUsers(function (err) {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
    let promiseMessages = new Promise(function (res, rej) {
        initMessages(function (err) {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
    Promise.all([promiseUsers, promiseMessages])
        .then(function () {
            return fn(null);
        })
        .catch(function (err) {
            return fn(err);
        });
}

module.exports = init;
