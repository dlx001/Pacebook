//create an express app
const express = require("express");
const bcrypt = require('bcryptjs');
var flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const { render } = require("ejs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { body, validationResult } = require("express-validator");
const autho = require("./routes/auth");
const profile=require("./routes/profile");



mongoose.set('strictQuery', true)
const dbLink="mongodb+srv://pacebook:test31415@cluster0.y7amop4.mongodb.net/Pacebook?retryWrites=true&w=majority";
mongoose.connect(dbLink,{useNewURLParser: true, useUnifiedTopology: true}).then(()=>app.listen(3000));

const app=express();


app.set("view engine", "ejs");
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},(username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: "Incorrect username" });
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return done(err);
        if (res) return done(null, user);
        else return done(null, false, { message: "Incorrect password" });
      });
    });
  }));
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
 

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(function(req, res, next) {
    res.locals.owner = req.user;
    next();
  });
  app.use('/auth',autho);
  app.use('/profile',profile);

//use ejs for view engine
app.set('view engine', 'ejs');


//create public files to href css styles
app.use(express.static('public'));

//links

app.get('/', (req,res)=>{
    res.render('index');
})
app.get('/404',(req,res)=>{
  res.render('404');
})



  app.get('/profile',(req,res)=>{
    res.redirect(404);
  });

