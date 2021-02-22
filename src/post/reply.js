const { Database } = require("sqlite3");
const timer = require("../util/timer");
const emitter = require("../util/emitter");
function reply(req, res, next) {
    let id = req.params.id;
    let user = req.session.name;
    let msg = req.body.message;
    let time = timer();
    let messagesDB = new Database("messages.db", function (err) {
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
                emitter.getEmitter().emit("reload /topic/" + id);
                res.redirect("/topic/" + id);
            }
        );
    });
}

module.exports = reply;
