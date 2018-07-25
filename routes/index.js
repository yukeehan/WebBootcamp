var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middlewareObj = require("../middleware");
var nodemailer    = require("nodemailer"),
    async         = require("async"),
    crypto        = require("crypto");


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
    failureRedirect:"/login",
    failureFlash: true
    })
);


// Logout Logic
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success","Logged Out Successfully!");
    res.redirect("/campgrounds");
});

// Forgot Form
router.get('/forgot', function(req, res){
    res.render('authentication/forgot', {user: req.user});
});

// Forgot Logic
router.post('/forgot', function(req, res, next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if(!user){
                    req.flash('error', 'No account with that email address exists');
                    return res.redirect('/forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;  // 1 hour
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                service:'Gmail',
                auth:{
                    user: 'yukeehan@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'yukeehan@gmail.com',
                subject: 'YelpCamp Password Reset',
                text:'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                      'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
});

// Password Reset Form
router.get('/reset/:token', function(req, res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires:{ $gt: Date.now() } }, function(err, user){
        if(!user){
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect('/forgot');
        }
        res.render('authentication/reset',{
            user: req.user,
            token: req.params.token
        });
    });
});

// Reset Password Logic
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.newPW === req.body.confirmPW) {
                                eval(require("locus"));
          user.setPassword(req.body.newPW, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'yukeehan@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'yukeehan@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});


// Change Password Form
router.get("/:id/reset", middlewareObj.checkProfileOwnership, function(req, res, next){
     async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            User.findById(req.params.id, function(err, foundUser){

                if(err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    foundUser.resetPasswordToken = token;
                    foundUser.resetPasswordExpires = Date.now() + 360000;  // 1 hour
                    foundUser.save();

                    res.render('authentication/reset_while_login',{
                        user: foundUser,
                        token: foundUser.resetPasswordToken
                        // done(err, token, foundUser);
                    });
                }
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('back');
    });
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
    });
});

module.exports = router;