var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// need for pre-hook
const Campground = require("./campground");
const Comment = require("./comment");


var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	email: String,
	bio: String,
	isPaid: {type:Boolean, default: false},
	isAdmin: {type: Boolean, default: false}
});

// pre-hook middleware to delete all user's posts and comments from DB when user is deleted. 
	// "This will fail silently on an error since the error isn't being handled. Can use next(err) or throw(err) etc.
UserSchema.pre("remove", async function(next){
	try {
		await Campground.find().where("author.id").equals(this._id).exec(function(err, campgrounds){
			if(err){
				console.log(err);
			}else{
				campgrounds.forEach(function(campground){
					campground.comments.forEach(function(comment){
						Comment.findByIdAndRemove(comment._id, function(err, comments){
							if(err){
								console.log(err);
							} else {
								console.log("DELETED COMMENTS FROM CG: "+ comments);
								console.log("removed comments from soon to be deleted campground");
							}
						});
					});
				});
			}
		});
		await Campground.remove({"author.id": this._id});
		await Comment.remove({"author.id": this._id});
		next();
	} catch(err){
		console.log(err);
	}
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);