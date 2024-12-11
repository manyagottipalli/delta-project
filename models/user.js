const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type:String,
        required:true // password will be defined by passportlocal moongose

    }
});
userSchema.plugin(passportLocalMongoose); // this is for password it automatically implements hashing salting of password
module.exports = mongoose.model('User',userSchema);
