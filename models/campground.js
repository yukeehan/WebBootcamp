var mongoose = require("mongoose");

var campgroundScehma = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    imageId: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createAt: {type: Date, default: Date.now},
    author:{
        id:{
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

module.exports = mongoose.model("Campground", campgroundScehma);