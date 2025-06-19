
module.exports = function checkRole( req, res, next, ...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({error: "Не авторизован"});
        }
        if (!roles.includes(req.user.role)) {
            next();
        } else {
            res.status(409).json({error: "Нет прав доступа"});

        }
    }};