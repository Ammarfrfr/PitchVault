import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            default: ""
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            minlength: 8,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        
        // ========== PITCHVAULT FIELDS ==========
        userType: {
            type: String,
            enum: ['founder', 'investor'],
            default: 'founder'
        },
        // For Founders
        companyName: {
            type: String,
            trim: true
        },
        // For Investors
        firmName: {
            type: String,
            trim: true
        },
        investmentFocus: {
            type: [String],  // Array of sectors they invest in
            default: []
        },
        checkSize: {
            type: String,  // e.g., "$50K - $500K"
            trim: true
        },
        bio: {
            type: String,
            maxlength: 500,
            trim: true
        },
        linkedIn: {
            type: String,
            trim: true
        },
        website: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

// we dont have .this in () arrow functions so we use default function
// this process takes time so we use async function

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    // password will change every time user is saved so we will check if password is modified

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){

    // we add await because compare function takes time
    // this.password is the hashed password stored in db
    return await bcrypt.compare(password, this.password)
}

// this is jwt function 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)