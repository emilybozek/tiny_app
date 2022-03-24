const express = require("express");
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");

// MIDDLEWARE

app.use(bodyParser.urlencoded({extended: true}), cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const userDatabase = { 
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

const generateRandomString = function () {
  let a = "abcdefghijklmnopqrsztuvwyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += a[Math.floor(Math.random() * 36)]
  }
  return result;
};

const emailExists = function (email) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function (id) {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url].longURL;
    }
  }
  return urls;
};

// ROUTES

// home page
app.get("/", (req, res) => {
  // if user is logged in redirect to urls, if not redirect to login
})

// URL page
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }

  const templateVars = { user_id: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// URL submit handler
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Error: not a valid user\n");
  } 

  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"].id }
  res.redirect(`/urls/${shortURL}`)
});

// new tiny URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  if (!req.cookies["user_id"]) {
    return res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});

//register page 
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
})

// register submit handler 
app.post("/register", (req, res) => {
  let shortUsername = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail === " " || userPassword === " " || userEmail === emailExists(userEmail)) {
    return res.sendStatus(400);
  }

  userDatabase[shortUsername] = { id: shortUsername, email: userEmail, password: userPassword }
  res.cookie("user_id", userDatabase[shortUsername]);
  res.redirect("/urls");
})

//login page 
app.get("/login", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }
  res.render("login", templateVars);
})

// login handler 
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (emailExists(userEmail)) {
    for (const user in userDatabase) {
      if (userDatabase[user].password === userPassword && userDatabase[user].email === userEmail) {
        res.cookie("user_id", userDatabase[user]); // sets cookie name to "user_id" and to value to userDatabase[user] <- the key in object
        res.redirect("/urls");
        return;
      }
    }
  }
  return res.sendStatus(403);
})

// logout handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// shortened URL page
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  if (req.cookies["user_id"].id !== urlDatabase[req.params.shortURL].userID) {
    return res.redirect("/urls")
  }
  const templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// handler
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("Short URL does not exist!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// url delete handler
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Error: Not valid user");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

// url edit handler
app.post("/urls/:shortURL/update", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Error: Not valid user\n");
  }
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});