const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
    try {
        console.log("Пользователь на главной:", req.user.name);
        res.render("main", { name: req.user.name });
    } catch (error) {
        console.error("Ошибка рендеринга главной страницы:", error);
        res.status(500).send("Внутренняя ошибка сервера");
    }
});

module.exports = router;