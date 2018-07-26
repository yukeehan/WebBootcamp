var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");

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
    });
});

module.exports = router;