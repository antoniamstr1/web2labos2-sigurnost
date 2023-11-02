var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require("fs");
const fs1 = require("fs");
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


const checkUserRole = (role) => (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
        next();
    } else {
        res.status(403).send('Za pristup ovoj stranici potreban je login.');
    }
};

app.get('/user', checkUserRole('user'), (req, res) => {
    res.render('user',{user: req.session.user});
});

app.get('/admin', checkUserRole('admin'), (req, res) => {
    res.render('admin',{user: req.session.user});
});

app.get('/management', (req, res) => {
    res.render('management');
});

app.get('/brokenAccess',  (req, res) => {
    res.render('brokenAccess',{user: req.session.user});
});

app.get('/login', function (req, res) {
    res.render('login', { displayText: '' });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const fs = require('fs');

    const data = fs.readFileSync('data.json', 'utf8');
    const userData = JSON.parse(data);

    if (username === 'user' && password === userData.find(user => user.username === 'user').password) {
        req.session.user = { username, role: 'user' };
    } else if (username === 'admin' && password === 'admin') {
        req.session.user = { username, role: 'admin' };
    } else if (username === 'management' && password === 'management') {
        req.session.user = { username, role: 'management' };
    }
    res.redirect('/brokenAccess');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/brokenAccess');
    });
});


app.get('/', function (req, res) {
    res.render('index', { displayText: '' });
});
app.get('/actionsubmit', function (req, res) {
    const upit = req.query.upit;
    const sigurnost = req.query.sigurnost;
    res.render('actionsubmit', { upit, sigurnost });
});

app.post('/actionsubmit', function (req, res) {

    const upit = req.body.upit;
    const sigurnost = req.body.sigurnost;
    //console.log('upit (POST):', upit);
    //console.log('sigurnost (POST):', sigurnost);

    res.render('actionsubmit', { upit, sigurnost });
});
app.get('/promjenaLozinke', function (req, res) {
    const filePath = 'data.json';
    const newPassword = req.query.loz;
    const fs1= require('fs');

    const data = fs1.readFileSync('data.json', 'utf8');
    const userData = JSON.parse(data);
    const userIndex = userData.findIndex(user => user.username === 'user');
    userData[userIndex].password = newPassword;


    res.render('user',{user: req.session.user});
});
app.post('/promjenaLozinke', function (req, res) {
    const filePath = 'data.json';
    const newPassword = req.body.loz2;
    const fs2= require('fs');

    const data = fs2.readFileSync('data.json', 'utf8');
    const userData = JSON.parse(data);
    const userIndex = userData.findIndex(user => user.username === 'user');
    userData[userIndex].password = newPassword;
    fs2.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8', err => {

    });

    res.render('user',{user: req.session.user});
});

app.listen(PORT, function () {
    console.log('Example app listening on port 3000!');
});
