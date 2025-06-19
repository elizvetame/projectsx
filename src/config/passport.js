const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const { User } = require("./db");


passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
}, function verify(email, password, cb) {
    (async function(){
        try {

            console.log('Соединение есть');
            const user = await User.findOne({where: { email:  email}});
            console.log(user);
            if (user !== null) {
                if (await bcrypt.compare(password,user.password)) {
                    cb(null, {email: user.email, role: user.role, name: user.name});
                } else {
                    console.log('Не верный email or password.');
                    cb(null, false, {message: 'Не верный email or password.'});
                    console.log('Не верный email or password.');
                }
            }

        } catch (error) {
            console.error('Соединение прервано:', error);
        }
    })();
}));


passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { email: user.email,  role: user.role, name: user.name });
    });
});


passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});


module.exports = passport;