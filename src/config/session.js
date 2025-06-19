const session = require("express-session");
const FileStore = require("session-file-store")(session);
require("dotenv").config();


module.exports =session({
    store: new FileStore({
        path: './sessions' || '/usr/app/sessions',
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
    }
})

