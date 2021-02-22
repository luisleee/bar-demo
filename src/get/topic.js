const { Database } = require("sqlite3");

function topic(req, res, next) {
    let id = req.params.id;
    let messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        messagesDB.get(
            "SELECT * FROM topics WHERE id = ?",
            id,
            function (err, row) {
                if (err) {
                    return next(err);
                }
                if (!row) {
                    res.redirect("/404.html");
                    return;
                }
                let context = { topic: row, username: req.session.name };
                messagesDB.all(
                    "SELECT * FROM replies WHERE fa = ?",
                    id,
                    function (err, rows) {
                        if (err) {
                            return next(err);
                        }
                        context.replies = rows;
                        res.render("topic.ejs", context);
                    }
                );
            }
        );
    });
}
module.exports = topic;
