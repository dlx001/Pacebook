//create an express app
const express = require("express");
const app=express();

//use ejs for view engine
app.set('view engine', 'ejs');

//listen on localhost 3000
app.listen(3000);

//create public files to href css styles
app.use(express.static('public'))

//links
app.get('/', (req,res)=>{
    res.render('index');
})

app.get('/signUp', (req,res)=>{
    res.render('signUp');
})