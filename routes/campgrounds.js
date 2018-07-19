var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");

// INDEX ROUTE
router.get("/", function(req, res){
    //get all campgrounds from the database
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
          res.render("campgrounds/index", {campgrounds:allCampgrounds}); 
        }
    })
});

// NEW ROUTE
router.get("/new", middlewareObj.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
    //show the form
})

// SHOW ROUTE
router.get("/:id", function(req, res){
    //find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            //render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground}); 
        }
    });

});

// CREATE ROUTE
router.post("/", middlewareObj.isLoggedIn, function(req, res){
    //get data from forms and add to the campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: description, author: author};
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newCamp){
        if(err){
            console.log(err);
        } else {
            //redirect to the /campgrounds page
             res.redirect("/campgrounds");
        }
    })
});

// Edit Route
router.get("/:id/edit", middlewareObj.checkCampgroundOwner, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error","Something goes wrong, please try again");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// Update Route
router.put("/:id", middlewareObj.checkCampgroundOwner, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCamp){
        if(err){
            console.log(err);
            req.flash("error","Something goes wrong, please try again");
            res.redirect("/campgrounds");
        } else {
            req.flash("success","Successfully updated!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Destroy Route
router.delete("/:id", middlewareObj.checkCampgroundOwner, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error","Something goes wrong, please try again");
            res.redirect("/campgrounds" + req.params.id);
        } else {
            req.flash("error","Successfully deleted!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;