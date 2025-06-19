const express = require("express");
const session = require("./src/config/session");
const passport = require("./src/config/passport");
const { sequelize } = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const indexRoutes = require("./src/routes/index");
const flash = require("express-flash");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.set("view engine", "ejs");
app.use(session);
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/", indexRoutes);
app.use("/", authRoutes);



// Start server
async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log("Соединение с БД установлено");
        app.listen(3000, () => {
            console.log("Сервер запущен на порту 3000");
        });
    } catch (error) {
        console.error("Ошибка инициализации:", error);
        process.exit(1);
    }
}

start();