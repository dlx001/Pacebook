const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    FirstName: String,
    Surname: String,
    email: String,
    birthday: Date,
    gender: Boolean,
    password: String
})

const User = mongoose.model('User',UserSchema);
module.exports = User;