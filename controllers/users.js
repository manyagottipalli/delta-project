const User = require("../models/user");


module.exports.renderSignUp = (req,res) => {
    res.render("users/signup.ejs");
};
 module.exports.signup = async (req,res,next) => {
    try{
        let {username,email,password} = req.body;
        const newUser =  new User({email,username}); // creating new user
       const registeredUser= await User.register(newUser,password); // it uses to register and returns the register user
       console.log(registeredUser);
       req.login(registeredUser,(err) => {
        if(err) {
            return next(err);
        }
        req.flash("success","welcome to wanderlust :)");
        res.redirect("/listings");
       });
      
    } catch(err) {
        req.flash("error",err.message);
        res.redirect("/signup");
    }
};
module.exports.renderLogin = (req,res) => {
    res.render("users/login.ejs");    
}


module.exports.login = async(req,res) => { // passport.authincate will check if user alredy exist or not
    req.flash("success","Welcome to wanderlust! you are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success","your logged out!");
        res.redirect("/listings");
    });
};