require('dotenv').config();

var express               = require("express"),
	app                   = express(),
	bodyParser            = require("body-parser"),
	mongoose              = require("mongoose"),
	flash                 = require("connect-flash"),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
	methodOverride        = require("method-override"),
	Campground            = require("./models/campground"),
	Comment               = require("./models/comment"),
	User                  = require("./models/user"),
	seedDB                = require("./seeds")

//requiring routes
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	userRoutes = require("./routes/users"),
	indexRoutes = require("./routes/index")
	
// Connecting local Mongo database
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_stripe";
mongoose.connect(url, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(()=>{
	console.log("Connected to database!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});

mongoose.set("useFindAndModify", false);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
app.locals.momentTimezone = require("moment-timezone");
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again, Sky wins cutest dog!",
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

app.use(indexRoutes);
app.use(userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.all("*", function(req, res){
	res.redirect("/");
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("YelpCamp_v2_Stripe Server has started!! On port: " + port);	
});