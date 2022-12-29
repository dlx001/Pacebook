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
    extended: false
  }));
  app.use(flash());



//use ejs for view engine
app.set('view engine', 'ejs');
app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/signup");
    });
  });

//create public files to href css styles
app.use(express.static('public'));

//links
app.post(
    "/profile",
      passport.authenticate("local", {
      successRedirect: "/profile",  
      failureRedirect: "/"
    })
);
app.get('/', (req,res)=>{
    res.render('index');
})

app.get('/signUp', (req,res)=>{
    req.flash("this is a test");
    res.render('signUp');
})


  app.get('/profile',(req,res)=>{
    res.render('profile',{ user: req.user });
  });
app.post('/',
    body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name empty.")
    .isAlpha()
    .withMessage("Name must be alphabet letters."),
    body("surname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name empty.")
    .isAlpha()
    .withMessage("Name must be alphabet letters."),
    body("email").trim().isLength({min:1}).withMessage("Email empty").isEmail().withMessage("Must be an Email").custom(value => {
      return User.findOne({email: value}).then(user => {
        if (user) {
          return Promise.reject('E-mail already in use');
        }
      });
    }),
    body("reenter").trim().isEmail().custom((value,{req}) => {
        if (value !== req.body.email) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    body("password","password must be at least 8 characters long").isLength({min:8}),
    body("birthday").isLength({min:1}).withMessage("Birthday empty").custom((value)=>{
        var today = new Date();
        var birthDate = new Date(value);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if(age<12){
            throw new Error("Must be at least 12 years old to make an account");
        }
        return true;
    }),
    body("gender","Must select a gender").isLength({min:1})
    ,(req,res)=>{
    const errors =validationResult(req);
    console.log(req.body);
    
    if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render('signUp',{alert});
    }
    else{
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if(err){
                console.log(err);
            }
            else{
                const user= new User({
                    FirstName: req.body.name,
                    Surname: req.body.surname,
                    email: req.body.email,
                    birthday: req.body.birthday,
                    gender: req.body.gender,
                    password: hashedPassword
                }).save(err=>{if(err){
                    return next(err)
                }})
            }
          });
        res.redirect("/");
    }
});