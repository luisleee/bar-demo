function redirect(req, res, next) {
    var url = req.query.url ? req.query.url : "/";
    var time = req.query.time ? req.query.time : 1;
    var text = req.query.text ? req.query.text : "Redirecting...";
    var context = { url, time, text };
    res.render("redirect.ejs", context);
}
module.exports = redirect;
