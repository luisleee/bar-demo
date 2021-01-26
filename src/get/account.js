const { join } = require("path");
function account(req, res, next) {
    var context = { name: req.session.name };
    res.render("account.ejs", context);
}

module.exports = account;
