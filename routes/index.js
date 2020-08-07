var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// root route
router.get("/", function(req, res){
	res.render("landing");
});


// ===========
// AUTH ROUTES
// ===========

// show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

// handle signup logic
router.post("/register", function(req, res){
	var newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			bio: req.body.bio,
			avatar: req.body.avatar
		}
	);
	
	if(req.body.adminCode === process.env.ADMINCODE){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/register");
			// console.log(req.flash()); this prints out the current req.flash object!
			// alternate flash message option below:
			// return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Successfully Signed Up. Welcome to YelpCamp, " + user.username + "!");
			res.redirect("/checkout");
		});
	})
});

// show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
});

// handling login logic
router.post("/login", function(req, res, next){
	passport.authenticate("local",
	{
		successRedirect: "/campgrounds", 
		failureRedirect: "/login",
		failureFlash: true,
		successFlash: "Welcome to YelpCamp, " + req.body.username + "!"
	}) (req, res);
});

// logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

// STRIPE: GET checkout
router.get('/checkout', middleware.isLoggedIn, async (req, res) => {
	// if(req.user.isPaid){
	// 	req.flash("success", "Your account is already paid.");
	// 	return res.redirect("/campgrounds");
	// }
	res.render('checkout', { amount: 20, page: "checkout" });
});

// STRIPE: POST pay
router.post('/pay', middleware.isLoggedIn, async (req, res) => {
	const { paymentMethodId, items, currency } = req.body;

 	const amount = 2000;

	try {
		// Create new PaymentIntent with a PaymentMethod ID from the client.
		const intent = await stripe.paymentIntents.create({
			amount,
			currency,
			payment_method: paymentMethodId,
			error_on_requires_action: true,
			confirm: true
		});
		
		console.log("💰 Payment received!");
		
		req.user.isPaid = true;
		await req.user.save();
		// The payment is complete and the money has been moved
		// You can add any post-payment code here (e.g. shipping, fulfillment, etc)
		
		// Send the client secret to the client to use in the demo
		res.send({ clientSecret: intent.client_secret });
	} catch (e) {
		// Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
		// See https://stripe.com/docs/declines/codes for more
		if (e.code === "authentication_required") {
			res.send({
				error: "This card requires authentication in order to proceeded. Please use a different card."
			});
		} else {
			console.log("Error coming from POST route: " + e);
			res.send({ error: e.message });
		}
	}
});



module.exports = router;
