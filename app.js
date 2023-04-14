const express = require('express');
const app = express();
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

const static = express.static(__dirname + '/public');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



app.use(express.json());

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}));

const logger = function(req, res, next) {
  curDate = new Date().toUTCString();
  method = req.method;
  route = req.originalUrl;
  authenticatedCheck = 'Not Logged In';
  if (req.session.user) {
      authenticatedCheck = 'Logged In';
  }
  console.log("[" + curDate + "] " + method + " " + route + " " + authenticatedCheck)
  next();
}

app.use(logger);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
