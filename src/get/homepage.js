const { Database } = require("sqlite3");
function homepage(req, res, next) {
    let messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        messagesDB.all("SELECT * FROM topics", function (err, rows) {
            if (err) {
                return next(err);
            }
            let data = {
                username: req.session.name,
                topics: rows.reverse(),
            };
            res.render("index.ejs", data);
        });
    });
}

module.exports = homepage;