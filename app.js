const express = require('express');
const morgan = require("morgan");
const http = require('http');
const path = require('path');
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const app = express();
const hbs = require('hbs');
const indexRouter = require('./routes/index');


const API_TOKEN = "5690764e041e60b23132eab4ec802871";
const marker = 262784;

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/eventbook", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(
    session({
        store: new FileStore(),
        key: "user_sid",
        secret: "anything here",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000
        }
    })
);

app.use(function (req, res, next) {
    res.locals = {
        loggedin: !!req.session.user,
        loggeduser: req.session.user ? req.session.user.username : false,
    };
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(indexRouter);

const server = http.createServer(app);
server.listen(3000);
