const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cookieSession({keys:['key1']}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// URL DATABASE
var urlDatabase = {
    "b2xVn2": {url: "http://www.lighthouselabs.ca",
            userId: "userRandomID"},
    "9sm5xK": {url:"http://www.google.com",
             userId: "user2RandomID"}
};

// USER DATABASE
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password:bcrypt.hashSync("dishwasher-funk",saltRounds)
  }
}

// FUNCTIONS
function saveURL(shortURL, longURL, userId) {
  urlDatabase[shortURL] = {
    url: longURL,
    userId: userId
  };
}

function loadURL(shortURL) {
  return urlDatabase[shortURL].url;
}

function createRandomString (length) {
  var str = '';
  for (var i = 0; i < length; i++) {
      str += Math.random().toString(36).substr(2);
      return str.substr( 0, length );
  }
}

function urlsForUser(database,userId) {
  var list=[];
  for(shortUrl in database) {
    var urlObject = database[shortUrl];
    if(urlObject.userId === userId) {
      urlObject.url_short=shortUrl;
      list.push(urlObject);
    }
  }
  return list;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// Render urls per user
app.get("/urls", (req, res) => {
  if (users[req.session.currentUserId]) {
    var usrId = users[req.session.currentUserId].id;
    let templateVars = {
      urls: urlsForUser(urlDatabase,usrId),
      user: users[usrId]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Adding new url
app.get("/urls/new", (req, res) => {
  if (users[req.session.currentUserId].id) {
    var usrId = users[req.session.currentUserId].id;
    let templateVars = {
      urls: urlsForUser(urlDatabase,usrId),
      user: users[usrId]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
 });

// Deleting a url from database
app.post('/urls/:id/delete', (req, res) => {
  if(users[req.session.currentUserId]){
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

// Edit url page
app.get("/urls/:id", (req, res) => {
  var usrId = req.session.currentUserId;
  let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      user: users[usrId]
    };
    res.render("urls_show", templateVars);
  });

// Loading url from database
app.get("/u/:shortURL", (req, res) => {
  const longURL = loadURL(req.params.shortURL);
  res.redirect(longURL);
});

// Storing url in database (creating new url)
app.post("/urls", (req, res) => {
  const value = req.body.longURL;
  const key = createRandomString(6);
  const userId = req.session.currentUserId;
  saveURL(key, value, userId);
  res.redirect('/urls');
});

// Storing cookie
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  for (let currentUserId in users) {
    let dbuser = users[currentUserId];
    if (dbuser.email === email && bcrypt.compareSync(password, dbuser.password)) {
      req.session.currentUserId = currentUserId;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Wrong email or password");
});

// Editing url in database
app.post("/urls/:id", (req, res) => {
  if(users[req.session.currentUserId]){
    saveURL(req.params.id, req.body.URL, req.session.currentUserId);
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/logout", (req, res) => {
  req.session = null;
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
    for (let currentUserId in users) {
      let dbuser = users[currentUserId];
      if (dbuser.email === email) {
        sameEmailFound = true;
        break;
      }
    }
    if (!sameEmailFound){
      var usrId = createRandomString(6);
      bcrypt.hash(password, saltRounds, function(err, hash) {
        let newUser = {
          id: usrId,
          email:email,
          password:hash
        };
        users[usrId] = newUser;
        req.session.currentUserId = newUser.id;
        res.redirect("/urls");
      });
    } else{
      res.status(400).send("E-mail already used");
    }
  }
});

// Log in page
app.get("/login", (req, res) => {
  res.render("login");
});