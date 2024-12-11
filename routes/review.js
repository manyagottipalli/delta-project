const express = require("express");
const router = express.Router({mergeParams: true}); // to handle the error cant read reviews null
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {validateReview, isLoggedin, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//review
//post
router.post("/",validateReview,isLoggedin, wrapAsync(reviewController.createreview));
// delete review route
router.delete("/:reviewId",
    isLoggedin,
    isReviewAuthor,
    wrapAsync(reviewController.deletereview));
module.exports = router;

