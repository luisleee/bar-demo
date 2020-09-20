function logout(req, res, next) {
    req.session.loggedIn = false;
    res.redirect("/");
}

module.exports = logout;