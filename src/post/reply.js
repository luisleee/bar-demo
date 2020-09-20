const { Database } = require("sqlite3");
const timer = require("../util/timer");
const emitter = require("../util/emitter");
function reply(req, res, next) {
    var id = req.params.id;
    var user = req.session.name;
    var msg = req.body.message;
    var time = timer();
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        messagesDB.run(
            "INSERT INTO replies(user, message, fa, time) VALUES (?, ?, ?, ?)",
            user,
            msg,
            id,
            time,
            function (err) {
                if (err) {
                    return next(err);
                }
                emitter.getEmitter().emit("reload" + id);
                res.redirect("/p/" + id);
            }
        );
    });
}

module.exports = reply;
