var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var csrf = require('csurf');
const fs2 = require("fs");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
var csrfProtect = csrf({ cookie: true })
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,

}));
app.use(cookieParser());
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
//u linku trebam imati username?

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


app.get('/',csrfProtect, function (req, res) {
    const fs = require('fs');
    let safeonlink = "";
    let safeofflink = "";
    if (PORT === 3000)
    {
        const mallink1 = fs.readFileSync('link.txt', 'utf8');
        const links1 = mallink1.split('\n').filter(url => url.trim() !== '');
         safeofflink = links1[0];
         safeonlink = links1[1];
    }

    else  {
        const mallink2 = fs.readFileSync('link_deployed.txt', 'utf8');
        const links2 = mallink2.split('\n').filter(url => url.trim() !== '');
         safeofflink = links2[0];
         safeonlink = links2[1];
    }
    res.render('index', {safeofflink, safeonlink, user: req.session.user });
});

app.get('/actionsubmit',csrfProtect, function (req, res) {
    var upit = req.query.upit;
    const sigurnost = req.query.sigurnost;

    var check = 1;
    //ak je safeon i ak ima klasničnih blacklist znakova ispisujem: detektiran pokušaj xss napada preko zlonamjernog linka
    if (sigurnost === "safeOn") {
        var forbiddenCharacters = /[.,<>%=]/; // Regular expression to match forbidden characters


        if (forbiddenCharacters.test(upit)) {
           check = 0;

        }
        if (PORT === 3000) {
            upit = "http://localhost:3000/actionsubmit?sigurnost=safeOn&upit=";
        }
        else {
            upit = "https://sigurnost-mmi9.onrender.com/actionsubmit?sigurnost=safeOn&upit=";
        }


    }
    res.render('actionsubmit', {check, upit, sigurnost });
});

app.post('/actionsubmit',csrfProtect, function (req, res) {

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

    const data2 = fs2.readFileSync('data.json', 'utf8');
    const userData = JSON.parse(data2);
    const userIndex = userData.findIndex(user => user.username === 'user');
    userData[userIndex].password = newPassword;
    fs1.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8', err => {

    });

    res.render('user',{user: req.session.user});
});
app.post('/promjenaLozinke1', function (req, res) {
    const filePath = 'data.json';
    const newPassword = req.body.loz2; // Use request body parameter 'loz2'
    const fs2 = require('fs');

    try {
        const data2 = fs2.readFileSync('data.json', 'utf8');
        const userData = JSON.parse(data2);
        const userIndex = userData.findIndex(user => user.username === 'user');
        userData[userIndex].password = newPassword;
        fs2.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf8', err => {
            if (err) {
                console.error(err);
            }
            res.render('user', { user: req.session.user });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, function () {
    console.log('Example app listening on port 3000!');
});
