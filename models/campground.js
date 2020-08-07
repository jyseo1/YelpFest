var mongoose = require("mongoose");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	location: String,
  	lat: Number,
	lng: Number,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

// campgroundSchema.pre("remove", async function(next){
// 	try{
// 		await Comment.remove({
// 			"_id": {
// 				$in: this.comments
// 			}
// 		});
// 		next();
// 	} catch(err){
// 		next(err);
// 	}
// });

module.exports = mongoose.model("Campground", campgroundSchema);