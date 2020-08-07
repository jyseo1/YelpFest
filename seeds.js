var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var seeds = [
	{name: "Yosemite", 
	 image: "https://static01.nyt.com/images/2018/11/11/travel/11yosemite2/merlin_145320882_abb47a0c-1a15-402a-8d30-9dcb7073e46b-superJumbo.jpg",
	 description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	},
	{
	name: "Big Sur", 
	image: "https://lp-cms-production.imgix.net/2019-06/28206231.jpg?fit=crop&q=40&sharp=10&vib=20&auto=format&ixlib=react-8.6.4",
	description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	},
	{
	name: "Lake Tahoe", 
	image: "https://media-cdn.tripadvisor.com/media/photo-m/1280/15/e0/1e/60/sand-harbor-lake-tahoe.jpg",
	description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	}
];

async function seedDB(){
	try{
		// 	Remove all campgrounds
		await Campground.deleteMany({});
		console.log("Campgrounds removed");
		// Remove all comments
		await Comment.deleteMany({});
		console.log("Comments removed");
		// new refactored loop
		for(const seed of seeds){
			let campground = await Campground.create(seed);
			console.log("Campground created");
			let comment = await Comment.create({
						text: "This place is great, but I wish there was internet",
						author: "Homer"	
					}
			)
			console.log("Comment created");
			campground.comments.push(comment);
			campground.save();
			console.log("Comment added to campground");
		}
	} catch(err){
		console.log(err);
	}
}

module.exports = seedDB;

