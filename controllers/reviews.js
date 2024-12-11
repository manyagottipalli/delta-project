const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
 
 
 
 module.exports.createreview = async(req,res) => { // we passed validateReview as a middleware
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save(); // this is to save in database
    await listing.save(); // this is to save newlisting in alreday existing data base
    req.flash("success","New review created!");
   res.redirect(`/listings/${listing._id}`);
};
module.exports.deletereview = async(req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted!");
    res.redirect(`/listings/${id}`);
};