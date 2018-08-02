var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: String,
    email: {type: String, required: true, unique: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    firstName: String,
    lastName: String,
    avatar: String,
    avatarId: String,
    gender: String,
    hobby: String,
    isAdmin: {type:Boolean, default: false},
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);