const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedin,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage}); // to initilize and where the files will be saved

router
.route("/") // by writing this we can avoid to write repeatdly path for routes
.get(wrapAsync(listingController.index)) // index route
.post(isLoggedin, // create route when form is submitted the request goes into post request
    // validateListing,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync((listingController.createroute))
);

 // new route this is written up because when written down it taking new as id and searches so error will come
 router.get("/new",isLoggedin,listingController.renderNewform);


router
.route("/:id")
.get(wrapAsync(listingController.showroute)) //show route
.delete(isLoggedin,isOwner, wrapAsync(listingController.deleteroute)) //delete route
.put(isLoggedin, //update route
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateroute)
);
  // edit route
  router.get("/:id/edit", isLoggedin,isOwner,wrapAsync(listingController.editroute));
 module.exports = router;
  