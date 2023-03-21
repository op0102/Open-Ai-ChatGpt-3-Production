const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not valid email address !!")

            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    customerId: {
        type: String,
        default:""
    },
    subscription :{
        type: String,
        default:""
    },

    tokens: [{ token: [{ type: String, required: true }] }],
    // tokens: { type: String, required: true },


},{ timestamps: true });


userSchema.pre("save", async function (next) {
    
    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }

    next();
}
);

// userToken generate process
userSchema.methods.generateAuthtoken = async function () {
    try {
        let token = JWT.sign({ _id: this._id }, SECRET_KEY);
        console.log(`generateAuthtoken token ${token}`);
        this.tokens = this.tokens.concat({ token: token });
        console.log(`tokens userSchema ${this.tokens}`);
        await this.save();
        return token;

    } catch (error) {
        console.log(error);
    }

}

// userToken generate process
// userSchema.methods.generateAuthtoken = async function () {
//     try {
//         let token = JWT.sign({ _id: this._id }, SECRET_KEY);
//         console.log(`generateAuthtoken token ${token}`);
//         this.tokens = token;
//         console.log(`tokens userSchema ${this.tokens}`);
//         await this.save();
//         return token;

//     } catch (error) {
//         console.log(error);
//     }

// }



const USER = mongoose.model('USER', userSchema);

module.exports = USER;





