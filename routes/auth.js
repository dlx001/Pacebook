const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { body, validationResult } = require("express-validator");
const User = require('../models/user');
const passport = require("passport");

router.get('/signUp', (req,res)=>{
    res.render('signUp');
})
router.post('/signup',
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
                    password: hashedPassword,
                    relStatus: " "
                }).save(err=>{if(err){
                    return next(err)
                }})
            }
          });
        res.redirect("/");
    }
});
router.post(
    "/login",
      passport.authenticate("local", {
      successRedirect: "/profile",  
      failureRedirect: "/"
    })
);

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/signup");
    });
  });
  module.exports= router;