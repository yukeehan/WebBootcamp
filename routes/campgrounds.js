require('dotenv').config();
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");
var User = require("../models/user.js")

var NodeGeocoder = require('node-geocoder');

// MULTER AND CLOUDINARY CONFIG
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'yukeehan', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// GOOGLE MAP CONFIG
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX ROUTE
router.get("/", function(req, res){
    var noMatch= undefined;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({"name": regex}, function(err, foundCamp){

            if(err){
                req.flash("error","Something went wrong. Please try again");
                res.redirect("/campgrounds");
            } else if(foundCamp.length < 1) {
                noMatch = "No Campground Match. Please Try Again";
                res.render("campgrounds/index", {campgrounds: foundCamp, page:'campgrounds', noMatch: noMatch}); 
            } else {
                res.render("campgrounds/index", {campgrounds:foundCamp, page:'campgrounds', noMatch: noMatch}); 
            }
        })
    } else {
       //get all campgrounds from the database
        Campground.find({},function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
              res.render("campgrounds/index", {campgrounds:allCampgrounds, page:'campgrounds', noMatch: noMatch}); 
            }
        }); 
    }
    
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
        // eval(require("locus"));
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            // render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground});
        }
    });

});

//CREATE - add new campground to DB
router.post("/", middlewareObj.isLoggedIn, upload.single('image'), function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          console.log(err);
          return res.redirect('back');
        }
        // eval(require("locus"));
        cloudinary.uploader.upload(req.file.path, function(result) {
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            req.body.campground.imageId = result.public_id;
            // add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            }

            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            
        // Create a new campground and save to DB
        Campground.create(req.body.campground, function(err, campground) {
            if (err) {
              req.flash('error', "Something went wrong, please try again");
              return res.redirect('back');
            }
                res.redirect('/campgrounds/' + campground.id);
            });
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
router.put("/:id", middlewareObj.checkCampgroundOwner, upload.single('image'), function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          console.log(err);
          return res.redirect('back');
        }
        Campground.findById(req.params.id, async function(err, foundCamp){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else{
                if(req.file){
                    try{
                        await cloudinary.v2.uploader.destroy(foundCamp.imageId); 
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        foundCamp.imageId = result.public_id;
                        foundCamp.image = result.secure_url;
                    } catch(err){
                        req.flash("error", "Campground not found");
                        res.redirect("back");
                    }
                }
                foundCamp.name = req.body.campground.name;
                foundCamp.description = req.body.campground.description;
                foundCamp.lat = data[0].latitude;
                foundCamp.lng = data[0].longitude;
                foundCamp.location = data[0].formattedAddress;
                foundCamp.save();
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + foundCamp._id);
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;