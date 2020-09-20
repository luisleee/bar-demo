var emitter = require("./../util/emitter");
var timer = require("./../util/timer")
const { Database } = require("sqlite3");
function send(req, res, next) {
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        var name = req.session.name;
        var title = req.body.title;
        var msg = req.body.message;
        var time = timer();

        if (!msg) {
            return next(err);
        }
        messagesDB.run(
            "INSERT INTO messages (user, title, message, time) VALUES (?, ?, ?, ?)",
            name,
            title,
            msg,
            time,
            function (err) {
                if (err) {
                    return next(err);
                }
                emitter.getEmitter().emit("reload");
                res.redirect("/");
            }
        );
    });
}
module.exports = send;
