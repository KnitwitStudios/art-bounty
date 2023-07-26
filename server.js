const express = require('express');
const session = require('cookie-session');
const helmet = require('helmet');
const compression = require('compression');

const fileupload = require("express-fileupload");
const path = require('path');
const bodyParser = require('body-parser');
const { forgotUserId, login } = require("./login.js");
const { buildDirectoriesIfNecessary, claimBounty, createBounty, deleteBounty, getAllBounties, getAllUsers } = require("./files.js");

const app = express();
const port = 80;
const debugUser = false;


app.use(compression());
app.use(fileupload());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false,
    secret: 'kws-secret'
}));

app.use(function(req, res, next){
    let loginError = req.session.loginError;
    let sendEmailSuccess = req.session.sendEmailSuccess;
    let sendEmailError = req.session.sendEmailError;

    delete req.session.loginError;
    delete req.session.sendEmailError;
    delete req.session.sendEmailSuccess;

    res.locals.emailFormMessage = '';
    res.locals.loginActive = true;
    res.locals.loginFormMessage = '';

    if (loginError)  res.locals.loginFormMessage = '<p class="text-right text-danger">' + loginError + '</p>';
    if (sendEmailSuccess) res.locals.emailFormMessage = '<p class="text-right text-success">' + sendEmailSuccess + '</p>';
    else if (sendEmailError) {
        res.locals.emailFormMessage = '<p class="text-right text-danger">' + sendEmailError + '</p>';
        res.locals.loginActive = false;
    }

    next();
  });

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session = null; 
    res.redirect('/');
});

app.post('/claim', (req, res) => {
    try {
        claimBounty(req.body.filename, req.body.userId, (req.body.claim === "true") ? true : false);
        res.writeHead(200, {'Content-Type': 'text/html'});
    } catch (err) {
        console.error(err)
        res.writeHead(501, {'Content-Type': 'text/html'});
    } finally {
        res.end();
    }
});

app.post('/delete', (req, res) => {
    try {
        deleteBounty(req.body.filename);
        res.writeHead(200, {'Content-Type': 'text/html'});
    } catch (err) {
        console.error(err)
        res.writeHead(501, {'Content-Type': 'text/html'});
    } finally {
        res.end();
    }
});

app.get('/board', (req, res) => {
    // There is a profile set up from the login page, so load bounty page
    if(req.session.profile) {
        buildDirectoriesIfNecessary(req.session.profile.userId);
        const allBounties = getAllBounties();

        req.session.profile.unclaimedBounties = allBounties.filter(bounty => bounty.claimer === "noone");
        req.session.profile.claimedBounties = allBounties.filter(bounty => bounty.claimer === req.session.profile.userId);
        
        req.session.profile.tags = allBounties
            .flatMap(bounty => bounty.tags)
            .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

        if (req.session.profile.isAdmin) {
            req.session.profile.users = getAllUsers();
            req.session.profile.allBounties = allBounties;
        }

        res.locals.profile = req.session.profile;

        res.render('board');
    } else {
        res.redirect('/');
    }
});

app.post('/create', function(req, res){
    try {
        createBounty(req.files, req.body.title, req.body.price, req.body.description, req.body.specifications, req.body.tags);
    } catch (err) {
        console.error(err);
    }
    res.redirect('/board');
});

app.post('/login', async function(req, res){
    if (debugUser) {
        req.session.profile = {name: "Debug", userId: "Debug", isAdmin: true};
        res.redirect('/board');
    } else {
        try {
            const result = await login(req.body.userId);
            if (result) {
                console.info(req.body.userId + ' logged in at ' + (new Date()).toString());
                req.session.profile = {name: result.name, userId: result.user_id, isAdmin: result.is_admin};
                res.redirect('/board');
            } else {
                req.session.loginError = "User ID does not exist";
                res.redirect('/');
            }
        } catch (err) {
            req.session.loginError = err.message;
            res.redirect('/');
        }    
    }    
});

app.post('/forgot', async function(req, res) {
    try {
        const success = await forgotUserId(req.body.email);
        if (success == true) {
            // res.writeHead(200, {'Content-Type': 'text/html'});
            req.session.sendEmailSuccess = "Email sent!";
        } else {
            // res.writeHead(400, {'Content-Type': 'text/html'});
            req.session.sendEmailError = "Email does not exist";
        }
    } catch (err) {
        // res.writeHead(500, {'Content-Type': 'text/html'});
        req.session.sendEmailError = err.message;
    }

    res.redirect('/');
});
  
app.listen(port, () => {
    console.info(`Art Bounty Site - listening on port ${port}`);
});
