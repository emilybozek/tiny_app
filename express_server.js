const express = require("express");
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");

// example URL database
const urlDatabase = {

}

// example user database
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

//
// MIDDLEWARE
//

app.use(bodyParser.urlencoded({extended: true}), cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// basic functions

function generateRandomString () {
  let a = "abcdefghijklmnopqrsztuvwyz0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += a[Math.floor(Math.random() * 36)]
  }

  return result;
};

function checkEmail () {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
}

//
// ROUTES
//

// no home page

// URL page
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// URL submit handler
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
});

//register page 
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  res.render("register", templateVars);
})

// new tiny URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

// register submit handler 
app.post("/register", (req, res) => {
  let shortUsername = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  userDatabase[shortUsername] = { id: shortUsername, email: userEmail, password: userPassword }
  
  if (userEmail === " " || userPassword === " " || userEmail === emailCheck(userEmail)) {
    return res.sendStatus(400);
  }
  
  res.cookie("user_id", userDatabase[shortUsername]);
  res.redirect("/urls");
  console.log(userDatabase[shortUsername])
})

// login handler 
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  res.cookie("user_id", username);
  res.redirect(`/urls`);
})

// logout handler
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// shortened URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// handler
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// url delete handler
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

// url edit handler
app.post("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id];
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

// 404
app.get('*',(req,res)=>{
  res.status(404);
  res.render('404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});