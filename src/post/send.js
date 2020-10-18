var emitter = require("./../util/emitter");
var timer = require("./../util/timer");
const { Database } = require("sqlite3");
function send(req, res, next) {
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        var user = req.session.name;
        var title = req.body.title;
        var text = req.body.text;
        var time = timer();

        if (!text) {
            return next(err);
        }
        messagesDB.run(
            "INSERT INTO topics (user, title, text, time) VALUES (?, ?, ?, ?)",
            user,
            title,
            text,
            time,
            function (err) {
                if (err) {
                    return next(err);
                }
                emitter.getEmitter().emit("reload /");
                res.redirect("/");
            }
        );
    });
}
module.exports = send;
