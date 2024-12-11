if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbURL = process.env.ATLASDB_URL;



main().then(()=>{
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect( dbURL);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


// this is to store session info in Atlas database
const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto:{
        secret :process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error",() => {
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7*24*60*1000,
        maxAge:7*24*60*1000,
        httpOnly:true, // to overcome cross scription attacks
    },
};
// app.get("/",(req,res) => { // this is our api
//     res.send("hi i am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // the session also uses the password so we write this
passport.use(new LocalStrategy(User.authenticate())); // this line means all users should use local stragery with authincation method
passport.serializeUser(User.serializeUser()); //to store info of user 
passport.deserializeUser(User.deserializeUser()); // to remove info of user




 app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
 });

//  app.get("/register", async (req,res) => {
//     let fakeUser = new User ({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });
//     let registeredUser = await User.register(fakeUser,"hello world");
//     res.send(registeredUser);
//  })

app.use("/listings",listingRouter); // see the listings in listing.js
app.use("/listings/:id/reviews",reviewRouter); // these are parent routes and the routes written in review.js and listing.js are child routes
app.use("/",userRouter);




  
app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page not found"));
});
app.use((err,req,res,next) => {
    let {statusCode =500, message="something went wrong!!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});
// this is to start the server
app.listen(8080,() => {
    console.log("server is listening to port 8080");
});