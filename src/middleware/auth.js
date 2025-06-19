module.exports = function auth(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ error: "Не авторизован" });
        res.redirect("/login");
    }
};