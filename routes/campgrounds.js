var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var NodeGeocoder = require('node-geocoder');
let { checkCampgroundOwnership, isLoggedIn, isPaid } = require("../middleware");
// router.use(isLoggedIn);
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
	if(req.query.paid) res.locals.success = "Payment succeeded, welcome to YelpCamp!";
	// Get all campgrounds from DB
	Campground.find({}, (function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});	
		}
	})).sort({'_id': -1});
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, function(req, res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	// var created = req.body.created;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	// adding Google Maps API code
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			console.log(err);
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
	var newCampground = {name: name, price: parseFloat(price).toFixed(2), image: image, description: desc, author: author, location: location, lat: lat, lng: lng}
	// Create a new campground and save to DB
		Campground.create(newCampground, function(err, newlyCreated){
			if(err){
				console.log(err);
			} else {
				console.log(newlyCreated);
				res.redirect("/campgrounds");
			}
		})
	});
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, isPaid, function(req, res){
	res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	// find the campground with provided ID	
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("/campgrounds");
			// console.log(err);
		} else {
			console.log(foundCampground);
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUD ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});	
	});
});

// UPDATE CAMPGROUD ROUTE
router.put("/:id", checkCampgroundOwnership, function(req, res){
	// Google Maps API
	geocoder.geocode(req.body.campground.location, function(err, data){
		if (err || !data.length) {
			console.log(err);  
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		
		req.body.campground.price = parseFloat(req.body.campground.price).toFixed(2);
		//find and update the correct campground
		Campground.findByIdAndUpdate(req.params.id, req.body.campground,
		function(err, updatedCampground){
			if(err){
				req.flash("error", err.message);
				res.redirect("/campgrounds");
			} else {
				//redirect shomewhere (show page)
				req.flash("success", "Successfully Updated!");
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			//remove all comments associated to this campground
			foundCampground.comments.forEach(function(comment) {
				Comment.findByIdAndRemove(comment._id, function(err){
					if(err){
						console.log(err);
					} else {
						console.log("removed comments from deleted campground");
					}
				})
			});
		}
	});
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", "Error while deleting campground");
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground deleted!");
			res.redirect("/campgrounds");
			console.log("deleted campground");
		}
	});
});


module.exports = router;




