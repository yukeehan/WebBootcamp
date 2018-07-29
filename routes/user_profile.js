var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");

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
router.put("/users/:id", upload.single('avatar'), function(req, res){
    User.findById(req.params.id, async function(err, foundUser){
        if(err){
            req.flash("error","Something went wrong, please try again");
            res.redirect("back");
        } else {
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(foundUser.avatarId); 
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    foundUser.avatar = result.secure_url;
                    foundUser.avatarId = result.public_id;
                } catch(err){
                    req.flash("error", "Failed to find the image, please try again");
                }
            }
            foundUser.firstName = req.body.user.firstName;
            foundUser.lastName = req.body.user.lastName;
            foundUser.gender = req.body.user.gender;
            foundUser.email = req.body.user.email;
            foundUser.hobby = req.body.user.hobby;
            foundUser.save();
            req.flash("success", "Profile successfully updated!");
            res.redirect("/users/" + req.params.id)
        }
    })
    // User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
    //     if(err){
    //         console.log(err);
    //         req.flash("error","Update profile failed");
    //         res.redirect("back");
    //     } else {
    //         req.flash("success", "Profile successfully updated!");
    //         res.redirect("/users/" + req.params.id)
    //     }
    // });
});

module.exports = router;