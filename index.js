const express = require('express')
const { engine } = require('express-handlebars');
const session = require('express-session');
const fs = require('fs');
const { nextTick } = require('process');

const app = express();
const PORT = 3000;

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false
}))
app.set("views", __dirname);
app.engine("hbs", engine({
    defaultLayout: 'main',
    layoutDir: __dirname,
    extname: '.hbs'
}));

app.set("view engine", "hbs")


function login(req, res, next) {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
}

//Db
const users = JSON.parse(fs.readFileSync('db.json'));

//Routes
app.get('/employees', login, (req, res) => {
    res.render('employees');
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Fill all the fields')
    }
    const user = users.find(u => u.email === req.body.email);
    if (!user || user.password !== req.body.password) {
        return res.status(400).send('Invalid Credentials');
    }
    req.session.userId = user.id;
    console.log(req.sessionID);
    res.redirect('/employees')

})

app.post('/edit', login, (req, res) => {
    const user = users.find(u => u.id = req.session.userId)
    user.email = req.body.email;
    console.log(`User ${user.id} email changed to ${user.email}`)
    res.send('Email Changed');
})

app.listen(PORT, () => console.log('Listening on port', PORT));