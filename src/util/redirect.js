function redirect(req, res, next) {
    let url = req.query.url ? req.query.url : "/";
    let time = req.query.time ? req.query.time : 1;
    let text = req.query.text ? req.query.text : "Redirecting...";
    let context = { url, time, text };
    res.render("redirect.ejs", context);
}
module.exports = redirect;
