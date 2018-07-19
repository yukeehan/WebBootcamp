var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


router.get("/", function(req, res){
    res.render("landing");
});

//======================
//   AUTH ROUTE
//======================

//register form
router.get("/register", function(req, res){
    res.render("authentication/register");
});

//register logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error",err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Thanks for register! Nice to meet you " + user.username + "!");
            res.redirect("/campgrounds");
        });
    });
});

// Login Form
router.get("/login", function(req, res){
    res.render("authentication/login");
});

// Login Logic using middleware 
router.post("/login", passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}), function(req, res){
});

// Logout Logic
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success","Logged Out Successfully!");
    res.redirect("/campgrounds");
});

module.exports = router;