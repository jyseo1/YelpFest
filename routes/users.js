var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// USER PROFILES Route- SHOW
router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "Uh oh! User not found");
			res.redirect("/campgrounds");
		} else{
			Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
			if(err){
				req.flash("error", "Error: Campground not found");
				return res.redirect("/");
			}
			res.render("users/show", { user: foundUser, campgrounds: campgrounds });
		})	
		}

	});
});

// EDIT USER ROUTE
router.get("/users/:id/edit", middleware.checkUser, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		// console.log("This is the foundUser " + foundUser);
		// console.log("This is the req.user "+ req.user);
		res.render("users/edit", {user: foundUser});
	});
});

// UPDATE USER ROUTE
router.put("/users/:id", middleware.checkUser, function(req, res){
	//Check if user is Admin
	if(req.user.isAdmin){
		//if user is admin, keep them as admin
		req.body.user.adminCode === process.env.ADMINCODE
	//if user is not admin
	} else{
			//check if entered code equals AdminCode
			if(req.body.user.adminCode === process.env.ADMINCODE){
				req.body.user.isAdmin = true;
			}else{
				req.body.user.isAdmin = false;
			}	
	}
				  
	// //check if entered username is already taken
	// User.findOne({username: req.body.user.username}, function(err, user){
	// 	console.log("This is the foundUser info" + user);
	// 	console.log("LOGGED IN USER INFO " + req.user);
	// 	console.log("THIS IS PARAM ID: " + req.params.id);
	// 	console.log("THIS IS PARAM OBJECT: " + req.params);
	// 	eval(require("locus"));
	// 	if(err){
	// 		req.flash("error", err.message);
	// 		res.redirect("/users/" + req.params.id);
	// 	}
	// 	if(req.user.username.equals(req.body.user.username)){
			
	// 	}else if(user){
	// 		req.flash("error", "Username is already taken.")
	// 		return res.redirect("back");
	// 	}

		
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
		if(err){
				req.flash("error", err.message);
				res.redirect("/users/" + req.params.id);
			} else {
				//redirect shomewhere (show page)
				req.flash("success", "Successfully updated profile!");
				res.redirect("/users/" + req.params.id);
			}
	});
});


// DELETE USER ROUTE
router.delete("/users/:id", middleware.checkUser, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/users/" + req.params.id);
		} 
		else{
			console.log("DELETING THIS USER NOW: " + foundUser);
			foundUser.remove();
			req.flash("success", "User deleted.");
			res.redirect("/campgrounds");
		}
	});
});




module.exports = router;