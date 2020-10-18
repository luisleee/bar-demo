const { Database } = require("sqlite3");
const { join } = require("path");
function homepage(req, res, next) {
    var messagesDB = new Database("messages.db", function (err) {
        if (err) {
            return next(err);
        }
        messagesDB.all("SELECT * FROM topics", function (err, rows) {
            if (err) {
                return next(err);
            }
            var data = {
                username: req.session.name,
                topics: rows.reverse(),
            };
            res.render(join(__dirname, "../../pages/index.ejs"), data);
        });
    });
}

module.exports = homepage;