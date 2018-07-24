var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");


router.get("/", function(req, res){
    res.render("landing");
});

//======================
//   AUTH ROUTE
//======================

//register form
router.get("/register", function(req, res){
    res.render("authentication/register", {page: 'register'});
});

//register logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if(req.body.AdminCode === "heshan"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        // eval(require("locus"));
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
    res.render("authentication/login", {page: 'login'});
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

// USER PROFILE ROUTE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error","user not found");
            res.redirect("back");
        } else {
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, foundCampground){
                if(err){
                    req.flash("error", "something went wrong");
                    res.redirect("/");
                } else {
                    res.render("users/show", {user: foundUser, campground: foundCampground});
                }
            })
        }
    });
});

// USER PROFILE EDIT ROUTE
router.get("/users/:id/edit", middlewareObj.checkProfileOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "something went wrong");
            res.redirect("back");
        } else {
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, foundCampground){
                if(err){
                    req.flash("error", "something went wrong");
                    res.redirect("back");
                }   else {
                    res.render("users/edit", {user: foundUser, campground: foundCampground});
                }
            });
        }
    })
});

// USER PROFILE UPDATE ROUTE
router.put("/users/:id", function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err){
            console.log(err);
            req.flash("error","Update profile failed");
            res.redirect("back");
        } else {
            req.flash("success", "Profile successfully updated!");
            res.redirect("/users/" + req.params.id)
        }
    })
})

module.exports = router;