//create an express app
const express = require("express");
var flash = require('connect-flash');
const app=express();
const mongoose = require('mongoose');
const { body, validationResult } = require("express-validator");
app.use(flash());
const bodyParser = require('body-parser');
const User = require('./models/user');
const { render } = require("ejs");
mongoose.set('strictQuery', true)
const dbLink="mongodb+srv://pacebook:test31415@cluster0.y7amop4.mongodb.net/Pacebook?retryWrites=true&w=majority";
mongoose.connect(dbLink,{useNewURLParser: true, useUnifiedTopology: true}).then(()=>app.listen(3000));
//use ejs for view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
  }));
//create public files to href css styles
app.use(express.static('public'));

//links
app.get('/', (req,res)=>{
    res.render('index');
})

app.get('/signUp', (req,res)=>{
    res.render('signUp');
})
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
    body("email").trim().isLength({min:1}).withMessage("Email empty").isEmail().withMessage("Must be an Email"),
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
        console.log(errors.mapped());
    }
    else{
        res.redirect("/");
    }
});