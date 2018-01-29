var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cookieParser());
app.set("view engine", "ejs");


// URL DATABASE
var urlDatabase = {
    b2xVn2: {url: "http://www.lighthouselabs.ca",
            userId: "userRandomID"},
    "9sm5xK": {url:"http://www.google.com",
             userId: "user2RandomID"}
};

// USER DATABASE
users = {
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
function saveURL(shortURL, longURL) {
  urlDatabase[shortURL].url = longURL;
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
  for(url in database) {
    var urlObject = database[url];
    console.log('urlObject',urlObject);
    if(urlObject.userId === userId) {
      urlObject.url_short=url;
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


// RENDER URLS PER USER
app.get("/urls", (req, res) => {
  if (users[req.cookies["currentUserId"]]) {
    console.log(users[req.cookies["currentUserId"]].id)
    var usrId = users[req.cookies["currentUserId"]].id;
    let templateVars = {
      urls: urlsForUser(urlDatabase,usrId),
      user: users[usrId]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// rendering page to add new url
app.get("/urls/new", (req, res) => {
  if (users[req.cookies["usrId"]]) {
    res.render("urls_new");
  } else {
    res.redirect("/login");
  }
 });

// deleting a url from database
app.post('/urls/:id/delete', (req, res) => {
  if(users[req.cookies["usrId"]]){
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  var usrId = req.cookies["usrId"];
  let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      user: users[usrId]
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

// Storing data in database (creating new url)
app.post("/urls", (req, res) => {
  const value = req.body.longURL;
  const key = createRandomString(6);
  saveURL(key, value);
  res.send("Ok");
});

// Storing cookie
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  for (let currentUserId in users) {
    let dbuser = users[currentUserId];
    if (dbuser.email === email && bcrypt.compareSync(password, dbuser.password)) {
      res.cookie("currentUserId", currentUserId);
      res.redirect("/urls");
      return;
    }
  }
  }
  res.status(403).send("Wrong email or password");
});

// Editing url in database
app.post("/urls/:id", (req, res) => {
  if(users[req.cookies["userId"]]){
    saveURL(req.params.id, req.body.URL);
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/logout", (req, res) => {
  res.clearCookie('currentUserId');
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
        console.log('hash',hash);
        let newUser = {
          id: usrId,
          email:email,
          password:hash
        };
        users[usrId] = newUser;
        res.cookie('currentUserId', newUser.id);
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



