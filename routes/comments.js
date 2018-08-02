var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = require("../middleware");

// ======================================================
//                 COMMENTS ROUTES
// ======================================================
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/", middlewareObj.isLoggedIn, function(req, res){
    // look up campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error","Something goes wrong, please try again");
                    console.log(err);
                } else {
                    // add id and username to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save(function(err, data){
                        if(err){
                            console.log(err);
                        } else {
                            req.flash("success","Successfully added comment!");
                            // redirct to the campground show page
                            res.redirect("/campgrounds/"+req.params.id); 
                        }
                    });
                }
            });
        }
    });
});

// Edit Route
router.get("/:comment_id/edit", middlewareObj.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    console.log(err);
                    req.flash("error","Comment not found");
                    res.redirect("back");
                } else {
                    res.render("comments/edit", {campground: foundCampground, comment: foundComment});
                }
            })
        }
    })
});

// Update Route
router.put("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            req.flash("error","Something goes wrong, please try again");
            res.redirect("/");
        } else {
            req.flash("success","Successfully updated comment!");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

// Destroy Route
router.delete("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success","Successfully deleted comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

module.exports = router;