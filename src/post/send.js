let emitter = require("./../util/emitter");
let timer = require("./../util/timer");
const { Database } = require("sqlite3");
function send(req, res, next) {
    let messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        let user = req.session.name;
        let title = req.body.title;
        let text = req.body.text;
        let time = timer();

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
