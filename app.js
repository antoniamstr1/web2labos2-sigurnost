var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const session = require('express-session');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


const checkUserRole = (role) => (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
        next();
    } else {
        res.status(403).send('Access denied. You do not have permission to access this resource.');
    }
};

app.get('/user', checkUserRole('user'), (req, res) => {
    res.render('user');
});

app.get('/admin', checkUserRole('admin'), (req, res) => {
    res.render('admin');
});

app.get('/management', (req, res) => {
    res.render('management');
});

app.get('/brokenAccess',  (req, res) => {
    res.render('brokenAccess');
});

app.get('/login', function (req, res) {
    res.render('login', { displayText: '' });
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Simplified authentication, should be replaced with a proper user database and authentication logic
    if (username === 'user' && password === 'user') {
        req.session.user = { username, role: 'user' };
    } else if (username === 'admin' && password === 'admin') {
        req.session.user = { username, role: 'admin' };
    } else if (username === 'management' && password === 'management') {
        req.session.user = { username, role: 'management' };
    }
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
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
    const enteredText = req.body.upit;
    const upit = req.body.upit;
    const sigurnost = req.body.sigurnost;
    //console.log('upit (POST):', upit);
    //console.log('sigurnost (POST):', sigurnost);

    res.render('actionsubmit', { upit, sigurnost });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
