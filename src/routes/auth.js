const express = require("express");
const router = express.Router();
const validator = require("email-validator");
const bcrypt = require("bcryptjs");
const { User } = require("../config/db");
const passport = require("passport");
const auth =  require("../middleware/auth")

const app = express();

app.use(express.json());
const saltRounds = 10;



/**
 * @swagger
 * /login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "manager@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged in"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Manager"
 *                     role:
 *                       type: string
 *                       example: "manager"
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Ошибка сервера
 */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/' ,
    failureRedirect: '/login'
}), (req, res) => {
    if (!req.user) {
       res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Logged in", user: { id: req.user.id, name: req.user.name, role: req.user.role } });
});

router.get('/', auth, async (req, res)  => {
    console.log(req.user.name);
    res.render('main', {  name: req.user.name });

});


router.get('/register', function(req, res) {
    res.render('register',{});
})


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TestUser"
 *                 description: Имя пользователя (минимум 2 символа)
 *               email:
 *                 type: string
 *                 example: "testuser@test.com"
 *                 description: Электронная почта в валидном формате
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Пароль (минимум 8 символов)
 *               role:
 *                 type: string
 *                 enum: [manager, team_lead, developer]
 *                 example: "developer"
 *                 description: Роль пользователя
 *             example:
 *               name: "TestUser"
 *               email: "testuser@test.com"
 *               password: "password123"
 *               role: "developer"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Пользователь успешно создан"
 *       400:
 *         description: Неверные данные (недопустимая роль или имя)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Недопустимая роль."
 *       409:
 *         description: Пользователь с таким email уже существует или пароль слишком короткий
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Пользователь c такой почтой уже есть"
 *       501:
 *         description: Неверный формат email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Неверный формат email."
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!validator.validate(email)) {
        res.status(501).json({ error: "Неверный формат email." });
        res.redirect("/register");
    }
    if (password.length < 8) {
        res.status(409).json({ error: "Пароль должен содержать минимум 8 символов." });
        res.redirect("/register");
    }
    if (!['manager', 'team_lead', 'developer'].includes(role)) {
        res.status(400).json({ error: "Недопустимая роль." });
        res.redirect("/register");
    }
    if (!name || name.length < 2) {
        res.status(400).json({ error: "Имя должно содержать минимум 2 символа." });
        res.redirect("/register");
    }

    (async function(){
        try {

            const user = await User.findOne( {where: { email: email} })//

            if(!user){
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await User.create({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: role
                });
                res.status(201).json({ error: "Пользователь успешно создан" });

            }
            else{
                res.status(409).json({ error: "Пользователь c такой почтой уже есть" });

            }



        } catch (error) {
            console.error('Соединение прервано:', error);
        }
    })();
});



/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Выход из системы
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Выход успешно выполнен"
 *       500:
 *         description: Ошибка при выходе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка при выходе из системы"
 */
router.post('/logout', auth, (req, res) => {


    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Ошибка при выходе из системы" });
        }

        res.clearCookie('connect.sid');

        return res.status(200).json({ message: "Выход успешно выполнен" });
    });
});


module.exports = router;