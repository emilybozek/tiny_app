// Requirements 

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, urlsForUser, getUserByEmail } = require("./helper-functions.js");

const PORT = 8080;
const app = express();
app.set("view engine", "ejs");

// Middleware

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["password", "key", "LHL"],

  maxAge: 24 * 60 * 60 * 1000 
}));

// Database
const urlDatabase = {};

const users = {};

// ROUTES

// Homepage
app.get("/", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    return res.redirect("/login");
  }
  return res.redirect("/urls")
});

// Registration 

app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  const user = users[req.session.userID];
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.sendStatus(400);
  }
  if (getUserByEmail(email, users)) {
    return res.sendStatus(400);
  }
  const userID = generateRandomString(4);
  const hashedPassword = bcrypt.hashSync(password);
  users[userID] = new User(userID, email, hashedPassword);
  req.session.userID = userID;
  req.session.userID = userID;
  res.redirect("/urls");
})

// Login

app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    return res.redirect("/urls")
  }
  const templateVars = { user };
  res.render("login", templateVars);
})
 
app.post("/login", (req, res) => {
  const { email, password } = req.body
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.sendStatus(403)
  }
  const passwordMatches = bcrypt.compareSync(password, user.hashedPassword);
  if (!passwordMatches) {
    return res.sendStatus(403);
  }
  req.session.userID = user.id
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//
app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
       return res.send("Not -logged in")
  }
  const urlList = urlsForUser(user, urlDatabase);
  const templateVars = {
    user,
    urlList
  }
  res.render("urls_index", templateVars);
});

// 
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    return res.redirect("/login")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

// 
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  if (!user) {
    return res.redirect("/login")
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//
app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    return res.send("Not logged in");
    } 
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = new shortURL(longURL, user.id);
  res.redirect(`/urls/${shortURL}`);
});

// 
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    return res.redirect("/login");
  }
  const shortUrl = req.params.shortURL;
  const longUrl = urlDatabase[shortURL].longURL;
  res.render("urls_show", templateVars);
});

//  
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  if (notLoggedIn(user)) {
    return res.send("Error: Not valid user\n");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// 
app.get("/u/:shortURL", (req, res) => {
  const user = users[req.session.userID];
  let shortUrl = req.params.shortURL;
  let longUrl = urlDatabase[shortUrl].longURL;
  res.redirect(longUrl);
});

//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});