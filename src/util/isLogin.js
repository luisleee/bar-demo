// Check if the user has logged-in
// If not, redirect to login
function isLogin(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect("/login.html");
    } else {
        next();
    }
}

module.exports = isLogin;