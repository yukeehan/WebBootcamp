var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX ROUTE
router.get("/", function(req, res){
    //get all campgrounds from the database
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
          res.render("campgrounds/index", {campgrounds:allCampgrounds, page:'campgrounds'}); 
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

//CREATE - add new campground to DB
router.post("/", middlewareObj.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      console.log(err);
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, price: price, image: image, description: description, author: author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
  });
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
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          console.log(err);
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
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