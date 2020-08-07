var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");

// all middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found!");
				//if not, redirect
				res.redirect("back");
			} else {
				//does user own the campground?
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash("error", "Error: You are not the owner of this post.");
					//otherwise, block access to edit page
					res.redirect("/campgrounds");
				}
			}
		});
	} else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				//if not, redirect
				res.redirect("back");
			} else {
				//does user own the comment?
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					//otherwise, block access to edit page
					res.redirect("back");
				}
			}
		});
	} else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	if(req["headers"]["content-type"] === "application/json"){
		console.log("Error coming from isLoggedIn middleware");
		return res.send({ error: "Login required!" });
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

middlewareObj.isPaid = function(req, res, next){
	if(req.user.isPaid) return next();
	req.flash("error", "Please pay registration fee before continuing");
	res.redirect("/checkout");
}

middlewareObj.checkUser = function(req, res, next){
	//checks if user is logged in
	if(req.isAuthenticated()){
		//find user whose profile you are on (via id in url)
		User.findById(req.params.id, function(err, foundUser){
			if(err || !foundUser){
				req.flash("error", "Error: User not found");
				res.redirect("/campgrounds");
			} else{
				//if logged in user owns the user profile
				if(foundUser._id.equals(req.user._id)){
					next();
					} else {
						req.flash("error", "You are not the profile owner.");
						//otherwise, block access to edit page
						res.redirect("/users/"+foundUser._id || "/campgrounds");
					}
				}
		});
	} else{
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

module.exports = middlewareObj;