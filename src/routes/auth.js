const express = require("express");
const router = express.Router();
const validator = require("email-validator");
const bcrypt = require("bcryptjs");
const { User } = require("../config/db");
const passport = require("passport");
const auth =  require("../middleware/auth")

const saltRounds = 10;




router.get('/login', function(req, res) {
    res.render('login');
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/', auth, async (req, res)  => {
    console.log(req.user.name);
    res.render('main', {  name: req.user.name });

});


router.get('/register', function(req, res) {
    res.render('register',{});
})



router.post('/register', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!validator.validate(email)) {
        req.flash("error", "Неверный формат email.");
        return res.redirect("/register");
    }
    if (password.length < 8) {
        req.flash("error", "Пароль должен содержать минимум 8 символов.");
        return res.redirect("/register");
    }
    if (!['manager', 'team_lead', 'developer'].includes(role)) {
        req.flash("error", "Недопустимая роль.");
        return res.redirect("/register");
    }
    if (!name || name.length < 2) {
        req.flash("error", "Имя должно содержать минимум 2 символа.");
        return res.redirect("/register");
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
                console.log('Пользователь успешно создан');
                res.redirect('/login');
            }
            else{
                console.log('Пользователь c такой почтой уже есть');
                res.redirect('/register');
            }



        } catch (error) {
            console.error('Соединение прервано:', error);
        }
    })();
});


module.exports = router;