 const Listing = require("../models/listing");
 const {listingSchema} = require("../schema.js"); //joi
 module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
      };
     module.exports.renderNewform = (req,res) => { // isLogged is a middleware see in middleware.js file
        res.render("listings/new.ejs");
    };
    module.exports.showroute = async(req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id)
        .populate({
          path:"reviews",
          populate:{
            path:"author",
          },
        })
        .populate("owner");
        if(!listing) {
          req.flash("error","Listing you requested for does not exist");
          res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs",{listing});
    };

    module.exports.createroute = async(req,res,next)=> {
      let url = req.file.path;
      let filename = req.file.filename;


      console.log(url,"..",filename);
            const newListing = new Listing(req.body.listing); // for newlisting should come owner so this statement
            newListing.owner = req.user._id;
            newListing.image = {url, filename};
             await  newListing.save();
             req.flash("success","New Listing created!");
            res.redirect("/listings");
    };
   module.exports.editroute =  async (req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
          req.flash("error","Listing you requested for does not exist");
          res.redirect("/listings");
        }
// this for image preview
       let originalImageUrl =  listing.image.url;
       originalImageUrl = originalImageUrl.replace("/upload","/upload/w_256");
        res.render("listings/edit.ejs",{listing, originalImageUrl});
    };
    module.exports.updateroute = async (req,res)=>{
        let {id} = req.params;
       let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); // desconstructiong of object there are many parameters dividing into individual


       if( typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
       listing.image = {url, filename};
       await listing.save();
       }

        req.flash("success","Listing Updated!");
        res.redirect(`/listings/${id}`); //it redirects into show 
    };
    module.exports.deleteroute = async(req,res)=>{
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success","Listing deleted!");
  
        res.redirect("/listings");
    }

    module.exports.search = async(req, res) => {
    console.log(req.query.q);
    let input = req.query.q.trim().replace(/\s+/g, " "); //remove start and end space
    console.log(input);
    if(input == "" || input == " "){
        //search value is empty
        req.flash("error", "Search value empty!!!");
        res.redirect("/listings");
    }

    //convert every word first letter capital and other small
    let data = input.split("");
    let element = "";
    let flag = false;
    for(let index = 0; index < data.length; index++) {
        if (index == 0 || flag) {
            element = element + data[index].toUpperCase();
        } else {
            element = element + data[index].toLowerCase();
        }
        flag = data[index] == " ";
    }
    console.log(element);

    let allListings = await Listing.find({
        title: { $regex: element, $options: "i"},
    });
    if(allListings.length !=0 ){
        res.locals.success = "Listings searched by title";
        res.render("listings/index.ejs", {allListings});
        return;
    }
    if(allListings.length == 0){
        allListings = await Listing.find({
            category: { $regex: element, $options: "i"},
        }).sort({_id: -1});
        if(allListings.length != 0) {
            res.locals.success = "Listings searched by category";
            res.render("listings/index.ejs", {allListings});
            return;
        }
    }
    if(allListings.length == 0) {
        allListings = await Listing.find({
            country: { $regex: element, $options: "i"},
        }).sort({_id: -1});
        if(allListings.length != 0) {
            res.locals.success = "Listings searched by country";
            res.render("listings/index.ejs", {allListings});
            return;
        }
    }
    if(allListings.length == 0) {
        allListings = await Listing.find({
            location: { $regex: element, $options: "i"},
        }).sort({_id: -1});
        if(allListings.length != 0) {
            res.locals.success = "Listings searched by location";
            res.render("listings/index.ejs", {allListings});
            return;
        }
    }

    const intValue = parseInt(element, 10); //10 for decimal return - int ya NaN
    const intDec = Number.isInteger(intValue); //check intValue is number or not

    if(allListings.length == 0 && intDec) {
        allListings = await Listing.find({ price: { $lte: element }}).sort({
            price: 1,
        });
        if(allListings.length != 0) {
            res.locals.success = `Listings searched for less than Rs ${element}`;
            res.render("listings/index.ejs", { allListings });
            return;
        }
    }
    if(allListings.length == 0) {
        req.flash("error", "Listings is not here !!!");
        res.redirect("/listings");
    }
}