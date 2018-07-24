var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    avatar: String,
    email: String,
    gender: String,
    hobby: String,
    isAdmin: {type:Boolean, default: false},
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);