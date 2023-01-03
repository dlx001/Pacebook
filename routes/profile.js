const express = require("express");
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user')
router.get('/:id',function(req,res){
    console.log(req);
    User.findOne({_id: req.params.id},(err,user)=>{
        if(err){
            res.redirect('/404');
        }
        else if(user){
            res.render('profile',{user:user});
        }
    });
})
router.post('/:id',function(req,res){
    User.findByIdAndUpdate({_id: req.params.id},{$set: req.body},(err, user) => {
        if(err) { console.log(err) };
        console.log(user);
        console.log(req.params.id);
    });
    User.findOne({_id: req.params.id},(err,user)=>{
        if(err){
            res.redirect('/404');
        }
        else if(user){
           //console.log(user);
           res.redirect('/profile/'+user.id);
        }
    });
})

router.get('/', function(req,res){
    res.redirect('/profile/'+req.user.id)
})
module.exports= router;