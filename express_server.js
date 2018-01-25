var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8080; // default port 8080


app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function saveURL(shortURL, longURL) {
  urlDatabase[shortURL] = longURL;
}

function loadURL(shortURL) {
  return urlDatabase[shortURL];
}



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
    let templateVars = { urls: urlDatabase };
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
    let templateVars = { 
      shortURL: req.params.id, 
      longURL: urlDatabase[req.params.id] 
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
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
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


app.post("/login", (req, res) => {
  res.cookie('username',req.body.username);
});

// app.post(cookieParser(secret, options)){}


