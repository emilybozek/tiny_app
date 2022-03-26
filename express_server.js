// Requirements 
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, urlsForUser, getUserByEmail } = require('./helper-functions.js');

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

//
// ROUTES
//

// Homepage
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

// User's URL database page
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Not logged in!");
  }
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id.id, urlDatabase);
  const templateVars = { user_id, urls };

  res.render("urls_index", templateVars);
});

// Create tiny URL page 
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user_id = req.session.user_id;
  const templateVars = { user_id };
  
  res.render("urls_new", templateVars);
});

// Registration 
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const user_id = req.session.user_id;
  const templateVars = { user_id };
  
  res.render("register", templateVars);
})

// Login
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const user_id = req.session.user_id;
  const templateVars = { user_id };
  
  res.render("login", templateVars);
})

// Tiny URL page with edit function
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Not logged in!");
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("Short URL does not exist!").status(400);
  }
  if (req.session.user_id.id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not own that URL!").status(400);
  }
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { user_id, shortURL, longURL };

  res.render("urls_show", templateVars);
});

// Short URL redirect to long url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("Short URL does not exist!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

// Error page
app.get("*", (req, res) => {
  res.render("/404");
});

// Tiny handler
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("User not valid!").status(400);
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  const userID = req.session.user_id.id;

  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// Registration handler
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password); 

  if (!email || !req.body.password) {
  return res.send("Error: Input fields cannot be left blank!").status(400);
  }
  if (getUserByEmail(email, users)) {
    return res.send("Error: User with that email already exists!").status(400);
  }

  users[id] = { id, email, password };
  req.session.user_id = users[id]; 
  res.redirect("/urls");
})

// Login handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!getUserByEmail(email, users) ||
    !bcrypt.compareSync(password, getUserByEmail(email, users).password) ||
    getUserByEmail(email, users).email !== email) {
    return res.send("Error: Invalid login!").status(403);
  }
  req.session.user_id = users[getUserByEmail(email, users).id];
  res.redirect("/urls");
});

// Logout handler
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Delete handler
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Not valid user!");
  }
  if (req.session.user_id.id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not own that URL!").status(400);
  }
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
})

// Edit handler
app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Not valid user!").status(400);
  }
  if (req.session.user_id.id !== urlDatabase[req.params.shortURL].userID) {
    return res.send("You do not own that URL!").status(400);
  }
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL].longURL = newURL;
  
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});