var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8080; // default port 8080

// let database = require('./database');

app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// USER DATABASE
let database = {};
database.users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Saving data functions
function saveURL(shortURL, longURL) {
  urlDatabase[shortURL] = longURL;
}

function loadURL(shortURL) {
  return urlDatabase[shortURL];
}



// Requests and responds to client
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
  var usrId = req.cookies["usrId"];

  console.log('usrId in get urls ', usrId);
  let templateVars = { 
    urls: urlDatabase,
    user: database.users[usrId]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// deleting an element in database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  var usrName = '';
  if(req.cookies){
    usrName = req.cookies["usrId"] ;
  } 
  let templateVars = { 
      shortURL: req.params.id, 
      longURL: urlDatabase[req.params.id],
      username: database.users[usrId]
    };
    
    res.render("urls_show", templateVars);
  });

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// loading data from database
app.get("/u/:shortURL", (req, res) => {
  const longURL = loadURL(req.params.shortURL);
  res.redirect(longURL);
});

// Storing data in database
app.post("/urls", (req, res) => {
  const value = req.body.longURL;
  const key = createRandomString(6);
  saveURL(key, value);
  res.send("Ok");         
});

// Editing url in database
app.post("/urls/:id", (req, res) => {
  saveURL(req.params.id, req.body.URL);
  res.redirect("/urls");         
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function createRandomString (length) {
  var str = '';
  for (var i = 0; i < length; i++) {
      str += Math.random().toString(36).substr(2);
      return str.substr( 0, length );
  }
}
// Storing cookie
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  for (let usrId in database.users) {
    let dbusr = database.users[usrId];
    if (dbusr.email === email && dbusr.password === password) {
      res.cookie('usrId', usrId);
      res.redirect("/urls");
      return; 
    }
  }
  res.status(403).send("Wrong email or password");
});

app.post("/logout", (req, res) => {
  res.clearCookie('usrId');
  res.redirect("/urls");
});


// Registration form
app.get("/register", (req, res) => {
  res.render("register");         
});

app.post('/register', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  if (!email || !password) {
    res.status(400).send("All fields are mandatory");
  } else {
    var sameEmailFound = false;
    for (let usrId in database.users) {
      let dbusr = database.users[usrId];
      if (dbusr.email === email) {
        sameEmailFound = true;
        break;
      }
    }
    if (!sameEmailFound){
      var usrId = createRandomString(6);
      let newUser = {
        id: usrId,
        email,
        password
      };
      database.users[usrId] = newUser; 
      res.cookie('usrId', newUser.id);
      res.redirect("/urls");
    } else{
      res.status(400).send("E-mail already used");
    }
  } 
});

// Log in page
app.get("/login", (req, res) => {
  res.render("login");         
});



