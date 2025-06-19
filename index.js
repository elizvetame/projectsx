const express = require("express");
const session = require("./src/config/session");
const passport = require("./src/config/passport");
const { sequelize } = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const indexRoutes = require("./src/routes/index");
const projectRoutes = require("./src/routes/project");
const taskRoutes = require("./src/routes/task");
const flash = require("express-flash");
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Middleware
app.use(express.json());

app.use(flash());
app.set("view engine", "ejs");
app.use(session);
app.use(passport.initialize());
app.use(passport.session());


const swaggerOptions = {
    swaggerDefinition: {
        myapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", projectRoutes);
app.use("/", taskRoutes);



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