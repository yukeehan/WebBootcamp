var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    flash         = require("connect-flash"),
    seedDB        = require("./seeds"),
    User          = require("./models/user"),
    cookieParser  = require("cookie-parser"),
    methodOverride = require("method-override")
    
var campgroundsRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index"),
    commentsRoutes = require("./routes/comments"),
    userProfileRoutes = require("./routes/user_profile")
    
// seedDB(); //seed the database

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(cookieParser('secret'));

mongoose.connect("mongodb//localhostmongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });

// mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });

app.locals.moment = require("moment");


// Passport Configuration
app.use(require("express-session")({
    secret:"yah",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/campgrounds", campgroundsRoutes);
app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentsRoutes);
app.use(userProfileRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("yelpCamp is started!");
});