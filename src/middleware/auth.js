module.exports = function auth(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.flash("error", "Пожалуйста, войдите в систему.");
        res.redirect("/login");
    }
};