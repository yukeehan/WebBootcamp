var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

middlewareObj.checkCampgroundOwner = function(req, res, next){
    // is logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err);
                req.flash("error","Something goes wrong, please try again");
                res.redirect("back");
            } else {
                // does user own this?
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    return next();
                } else {
                    req.flash("error", "You Don't Have Permission To Access It");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            }
        });    
    } else {
        req.flash("error", "Please Login First");
        res.redirect("/login");
    }    
}

// checkCommentOwnership
middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You Don't Have Permission To Access It");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("back");
    }
}

middlewareObj.checkProfileOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if(err || !foundUser){
                req.flash("error", "User not found");
                res.redirect("back");
            } else {
                if(foundUser._id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You Don't Have Permission To Access It");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "Please Login First");
        res.redirect("back");
    }
}

module.exports = middlewareObj;