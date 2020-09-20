const { join } = require("path");
function account(req, res, next) {
    var context = { name: req.session.name };
    res.render(join(__dirname, "../../pages/account.ejs"), context);
}

module.exports = account;
